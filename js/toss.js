var api = 'https://oss.conchbrain.club'
var prefix = 'oss_key'

var files = []
var totalSize = 0
var uploadedSize = 0;
var fileHandlers = []

function keyBase() {
    let base = localStorage.getItem(prefix)
    if (!base) {
        base = guid()
        localStorage.setItem(prefix, base)
    }
    return base
}

async function addFile() {
    let items = await showOpenFilePicker({ multiple: true })
    fileHandlers.push(...items);
    renderPending(fileHandlers)
}

async function addFolder() {
    fileHandlers.push(await showDirectoryPicker())
    renderPending(fileHandlers)
}

function removeFile(fileName) {
    fileHandlers.splice(fileHandlers.findIndex(i => i.name == fileName), 1)
    renderPending(fileHandlers)
}

async function renderPending(handlers, target = '#pending') {
    let parent = document.querySelector(target)

    if (target == '#pending') {
        parent.innerHTML = handlers.length == 0 
            ? '<p class="text-center py-2 m-0">Pending list</p>' 
            : ''
    }

    for (let handler of handlers) {
        if (handler.kind == 'file') {
            await showFile(handler, parent)
        }

        if (handler.kind == 'directory') {
            await showFolder(handler, parent)
        }
    }
}

async function showFile(handler, parent) {
    let file = await getFile(handler)

    let expires = file.uploaded ? `
        <p class="m-0">
            <span class="badge badge-warning">Expires: ${new Date(Date.parse(file.uploaded) + 24 * 60 * 60 * 1000).toLocaleString()}</span>
        </p>` : ''

    parent.innerHTML +=`
        <div class="card-header" style="background-color: whitesmoke;">
            <div class="d-flex w-100 justify-content-between">
                <div>
                    <p class="mb-1">${file.name}</p>
                    <small ${file.key ? '' : 'hidden'}>
                        <a href="javascript:void(0)" onclick="downloadFile('${file.key}')">View</a> &nbsp;
                        <a href="javascript:void(0)" onclick="downloadFile('${file.key}', true)">Download</a> &nbsp;
                        <a href="javascript:void(0)" onclick="deleteFile('${file.key}')">Delete</a> &nbsp;
                    </small>
                </div>
                <div class="text-right">
                    ${expires}
                    <p class="m-0">
                        <span class="badge badge-primary">Size: ${Math.round(file.size / 1000)}kb</span>
                    </p>
                </div>
            </div>
        </div>`
}

async function showFolder(handler, parent) {
    let id = 'folder_' + guid()

    parent.innerHTML += `
        <div class="card">
            <div class="card-header" style="background-color: white; cursor: pointer;">
                <div class="d-flex w-100 justify-content-between" data-toggle="collapse" data-target="#${id}">
                    <div>
                        <p class="mb-1">${handler.name}</p>
                        <small>${handler.kind}</small>
                    </div>
                </div>
            </div>
            <div id="${id}" class="collapse"></div>
        </div>`

    let children = await getChildren(handler)
    await renderPending(children, `#${id}`)
}

function downloadFile(key, attachment = false) {
    let url = `${api}/${key}` + (attachment ? '?attachment=true' : '')
    window.open(url)
}

async function deleteFile(key) {
    toast("Conchbrain OSS", "Deleting...")

    await fetch(`${api}/${key}`, {
        method: 'DELETE',
    })
    .catch(err => {
        alert(err)
    })
    .finally(() => {
        renderUploaded()
    })
}

async function upload() {
    files.splice(0)
    await getAllFiles(fileHandlers)

    if (files.length == 0) {
        toast("Conchbrain OSS", "Empty pending list")
        return
    }

    updateUploadStatus(true)
    toast("Conchbrain OSS", "Uploading...")

    for (let file of files) {
        let reader = file.stream().getReader();

        await fetch(`${api}/${file.key}`, {
            method: 'PUT',
            body: file
        })
        .catch(err => {
            alert(err)
            updateUploadStatus(false)
        })

        while (true) {
            let { done, value } = await reader.read()
            if (done) break

            uploadedSize += value.length
            let progress = (uploadedSize / totalSize) * 100;

            console.log(`Upload progress: ${progress.toFixed(2)}%`)
            document.querySelector('#progress').style.width = `${progress}%`

            if (uploadedSize != totalSize) continue

            fileHandlers = []
            renderPending(fileHandlers)
            renderUploaded()

            setTimeout(() => {
                updateUploadStatus(false)
                document.querySelector('#progress').style.width = '0'
                toast("Conchbrain OSS", "Upload Success")
            }, 2000)
        }
    }
}

function updateUploadStatus(uploading = false) {
    let html = `
        <div class="spinner-border" style="height: 17px; width: 17px;" role="status">
            <span class="sr-only">Loading...</span>
        </div>`
    
    let btn = document.querySelector('#btn-upload')

    if (uploading) 
        btn.setAttribute('disabled', 'disabled')
    else
        btn.removeAttribute('disabled')

    btn.innerHTML = uploading ? html : 'Upload'
}

async function getFile(handler) {
    if (handler.getFile) {
        return await handler.getFile()
    }
    return handler
}

async function getChildren(handler) {
    let children = []

    if (handler.values) {
        for await (let child of handler.values()) {
            children.push(child)
        }
    }
    else {
        children = handler.children
    }

    return children.sort((a, b) => b.kind.length - a.kind.length)
}

async function getAllFiles(handlers, base = '') {
    if (!base) {
        base = keyBase()
        totalSize = 0
        uploadedSize = 0
    }

    for await (let item of handlers) {
        if (item.kind == 'file') {
            let file = await item.getFile()
            file.key = `${base}/${file.name}`
            totalSize += file.size
            files.push(file)
        }

        if (item.kind == 'directory') {
            let children = []
            for await (let child of item.values()) {
                children.push(child)
            }
            let key = `${base}/${item.name}`
            await getAllFiles(children, key)
        }
    }
}

async function renderUploaded() {
    let url = `${api}/?prefix=${keyBase()}`
    let res = await fetch(url)

    let files = (await res.json()).objects
    let handlers = []

    document.querySelector('#uploaded').innerHTML = files.length == 0 
        ? '<p class="text-center py-2 m-0">Uploaded list</p>' 
        : ''

    files.forEach(file => {
        let current = handlers
        let parts = file.key.split('/').slice(1)

        parts.forEach((part, index) => {
            let handler = current.find(i => i.name == part)

            if (!handler) {
                if (index == parts.length - 1) {
                    handler = Object.assign({ name: part, kind: 'file' }, file)
                }
                else {
                    handler = { name: part, kind: 'directory', children: [] }
                }
                current.push(handler)
            }
            current = handler.children
        })
    })

    renderPending(handlers, '#uploaded')
}

function init() {
    let regex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
    let href = location.href.substring(location.href.indexOf("#") + 1)
    let id = href.split('/').at(1)

    if (!id || !regex.test(id)) {
        navigate(`toss/${keyBase()}`)
        return
    }

    localStorage.setItem(prefix, id)
    renderPending(fileHandlers)
    renderUploaded()
}

init()