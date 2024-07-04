const api = 'https://oss.conchbrain.club'

let files = []
let totalSize = 0
let uploadedSize = 0;
let fileHandlers = []

function keyBase() {
    let key = 'oss_key'
    let base = localStorage.getItem(key)
    if (!base) {
        base = guid()
        localStorage.setItem(key, base)
    }
    return base
}

async function addFile() {
    let items = await showOpenFilePicker({ multiple: true })
    fileHandlers.push(...items);
    render(fileHandlers)
}

async function addFolder() {
    fileHandlers.push(await showDirectoryPicker())
    render(fileHandlers)
}

function removeFile(fileName) {
    fileHandlers.splice(fileHandlers.findIndex(i => i.name == fileName), 1)
    render(fileHandlers)
}

async function render(handlers, target = '#fileList') {
    let parent = document.querySelector(target)

    if (target == '#fileList') {
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
    console.log()

    parent.innerHTML +=`
        <div class="card-header" style="background-color: whitesmoke;">
            <div class="d-flex w-100 justify-content-between">
                <div>
                    <p class="mb-1">${file.name}</p>
                    <small>
                    ${
                        (() => {
                            return file.key 
                                ? `<a href="${api}/${file.key}" target="_blank">Download</a>` 
                                : ''
                        })()
                    }
                    </small>
                </div>
                <div>
                    <small>${Math.round(file.size / 1000)}kb</small>
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
    await render(children, `#${id}`)
}

async function upload() {
    files.splice(0)
    await getAllFiles(fileHandlers)

    for (let file of files) {
        let reader = file.stream().getReader();

        await fetch(`${api}/${file.key}`, {
            method: 'PUT',
            body: file
        })
        .catch(err => {
            alert(err)
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
            render(fileHandlers)
            showUploaded()

            document.querySelector('#progress').style.width = '0'
            toast("OSS", "Upload Success")
        }
    }
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

async function showUploaded() {
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

    render(handlers, '#uploaded')
}

render(fileHandlers)
showUploaded()