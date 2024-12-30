var api = 'https://smail.conchbrain.club/api'
var tossApi = 'https://oss.conchbrain.club'
var timeout = undefined

var address = localStorage.getItem('email_address')
var emails = []
var selectedId = undefined
var selectedEmail = undefined

/**
 * Email address
 */

function copyAddress() {
    navigator.clipboard.writeText(address).then(() => {
        alert('Copied to clipboard successfully')
    })
}

function getNewAddress() {
    address = undefined
    getAddress().then(() => {
        renderAddress()
    })
}

async function getAddress() {
    if (address) return

    let res = await fetch(api, {
        method: 'post'
    })

    address = await res.text()
    localStorage.setItem('email_address', address)
}

function renderAddress() {
    document.querySelector('#address').value = address.substring(0, address.indexOf('@'))
}

/**
 * Inbox
 */

async function getInbox() {
    document.querySelector('#refresh').innerHTML = '<div class="spinner-border spinner-border-sm"></div>'

    let res = await fetch(`${api}?email=${address}`)
    emails = res.status == 200 
        ? (await res.json()).emails 
        : []

    document.querySelector('#refresh').innerHTML = 'Refresh'
}

async function renderInbox() {
    if (emails.length == 0) {
        document.querySelector('lottie-player').removeAttribute('hidden')
    }
    else {
        document.querySelector('lottie-player').setAttribute('hidden', '')
    }

    let emailArea = document.querySelector('.message-list')
    emailArea.innerHTML = ''

    emails.forEach(email => {
        emailArea.innerHTML += `
            <div class="row rounded message" onclick="renderEmail('${email.id}')">
                <div class="col-2 from">
                    <span class="title">${email.from.name ?? email.from.address}</span>
                </div>
                <div class="col subject">
                    <div class="overflow-hidden">
                        <span class="subject">${email.subject ?? 'Unknow'}</span>
                    </div>
                </div>
                <div class="col-2 text-right createdAt">
                    <span class="date">${email.createdAt}</span>
                </div>
            </div>
        `
    })

    document.querySelector('.counter').innerText = emails.length
}

/**
 * Email Detail
 */

async function getEmail() {
    let res = await fetch(`${api}?email=${address}&id=${selectedId}`)

    selectedEmail = res.status == 200 
        ? (await res.json()).email 
        : undefined
}

function renderEmail(id) {
    selectedId = id
    let emailContent = document.querySelector('#email')
    emailContent.innerHTML = '<div class="spinner-grow text-dark mx-auto d-block" role="status" />'
    $('#emailModal').modal()

    getEmail().then(() => {
        document.querySelector('#emailModal .modal-title').innerText = selectedEmail.subject
        emailContent.innerHTML = ''

        // render email base info
        let emailInfo = `
            <p class="border-bottom">
                <span>From:</span>
                <span class="badge badge-secondary">${selectedEmail.from.address}</span>
            </p>

            <p class="border-bottom">
                <span>To:</span>
                ${
                    selectedEmail.to
                        .map(i => '<span class="badge badge-secondary mr-1">' + i.address + '</span>')
                        .toString()
                        .replaceAll(',', '')
                }
            </p>`

        if (selectedEmail.cc) {
            emailInfo += `
                <p class="border-bottom">
                    <span>CC:</span>
                    ${
                        selectedEmail.cc
                            .map(i => '<span class="badge badge-secondary mr-1">' + i.address + '</span>')
                            .toString()
                            .replaceAll(',', '')
                    }
                </p>`
        }

        emailContent.innerHTML += `<div class="pb-2">${emailInfo}</div>`

        // render email attachments
        let emailAttachments = selectedEmail.attachments
            .map(file => {
                let url = `${tossApi}/tmail_attachments/${selectedEmail.messageId}/${file.filename}`
                return `
                    <a href="${url}" target="_blank" class="btn btn-outline-secondary mr-1 mb-1">
                        ${file.filename}
                        <span class="badge badge-light">${file.mimeType}</span>
                    </a>`
            })
            .toString()
            .replaceAll(',', '')

        emailContent.innerHTML += `<div class="pb-2">${emailAttachments}</div>`

        // render email content
        let html = document.createElement('div')
        html.innerHTML = selectedEmail.html
        html.querySelectorAll('style').forEach(i => i.remove())

        emailContent.innerHTML += `<div class="px-3">${html.innerHTML}</div>`
    })
}

/**
 * Renderer
 */

async function init() {
    getAddress().then(() => {
        renderAddress()
    })

    getInbox().then(() => {
        renderInbox()
    })

    timeout = setTimeout(init, 1000 * 10)
}

onNavigated = (name, isBack) => {
    if (name == 'tmail') return
    clearTimeout(timeout)
    onNavigated = undefined
}

init()
