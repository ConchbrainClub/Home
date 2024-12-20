var api = 'https://smail.conchbrain.club/api'
var tossApi = 'https://oss.conchbrain.club'

var address = localStorage.getItem('email_address')
var emails = []
var selectedId = undefined
var selectedEmail = undefined

/**
 * Email address
 */

function copyEmailAddress() {
    navigator.clipboard.writeText(address).then(() => {
        alert('Copied to clipboard successfully')
    })
}

async function getEmailAddress() {
    if (address) return

    let res = await fetch(api, {
        method: 'post'
    })

    address = await res.text()
    localStorage.setItem('email_address', address)
}

function renderEmailAddress() {
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
        let unread = true ? 'unread' : ''

        emailArea.innerHTML += `
            <div class="row rounded message ${unread}" href="javascript:renderEmail('${email.id}')">
                <div class="col-md-3">
                    <div class="checkbox-wrapper-mail mr-2">
                        <input type="checkbox" id="${email.id}">
                        <label for="${email.id}" class="toggle"></label>
                    </div>
                    <a class="title">${email.from.name ?? email.from.address}</a>
                </div>
                <div class="col-md-6">
                    <a class="subject">${email.subject ?? 'Unknow'}</a>
                </div>
                <div class="col-md-3 text-right">
                    <div class="date">${email.createdAt}</div>
                </div>
            </div>
        `
    })
}

/**
 * Email Detail
 */

async function getEmail() {
    let res = await fetch(`${api}?email=${address}&id=${selectedId}`)

    selectedEmail = res.status == 200 
        ? (await res.json()).email 
        : undefined
    
    console.log(selectedEmail)
}

function renderEmail(id) {
    document.querySelectorAll('.active').forEach(i => i.classList.remove('active'))
    document.querySelector(`#${id}`).classList.add('active')
    selectedId = id

    getEmail().then(() => {
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

        document.querySelector('#email > .info').innerHTML = emailInfo

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

        document.querySelector('#email > .attachments').innerHTML = emailAttachments

        // render email content
        let html = document.createElement('div')
        html.innerHTML = selectedEmail.html
        html.querySelectorAll('style').forEach(i => i.remove())

        document.querySelector('#email > .content').innerHTML = html.innerHTML
    })
}

/**
 * Renderer
 */

let timeout = undefined

async function init() {
    getEmailAddress().then(() => {
        renderEmailAddress()
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
