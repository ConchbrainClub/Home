var api = 'https://smail.conchbrain.club/api'

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
    let res = await fetch(`${api}?email=${address}`)
    emails = res.status == 200 
        ? (await res.json()).emails 
        : []
}

async function renderInbox() {
    if (emails.length == 0) {
        document.querySelector('lottie-player').removeAttribute('hidden')
    }
    else {
        document.querySelector('lottie-player').setAttribute('hidden', '')
    }

    let emailArea = document.querySelector('#emails')
    emailArea.innerHTML = ''

    emails.forEach(email => {
        let active = selectedId == email.id ? 'active' : ''

        emailArea.innerHTML += `
            <a id="${email.id}" href="javascript:renderEmail('${email.id}')" class="list-group-item list-group-item-action ${active}">
                <div class="d-flex w-100 justify-content-between">
                    <p class="mb-1">${email.subject ?? 'Unknow'}</p>
                    <small>${email.createdAt}</small>
                </div>
                <small>And some small print.</small>
            </a>
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
        let html = document.createElement('div')
        html.innerHTML = selectedEmail.html
        html.querySelectorAll('style').forEach(i => i.remove())

        document.querySelector('#email').innerHTML = html.innerHTML
        renderInbox()
    })
}

/**
 * Renderer
 */

async function init() {
    getEmailAddress().then(() => {
        renderEmailAddress()
    })

    getInbox().then(() => {
        renderInbox()
    })

    setTimeout(init, 1000 * 10)
}

init()
