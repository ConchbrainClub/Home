const api = 'http://localhost:8787'

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
    if (target == '#fileList') parent.innerHTML = ''

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
    let file = await handler.getFile()

    parent.innerHTML +=`
        <div class="card-header" style="background-color: whitesmoke;">
            <div class="d-flex w-100 justify-content-between">
                <div>
                    <p class="mb-1">${file.name}</p>
                    <small>And some small print.</small>
                </div>
                <div>
                    <small>${Math.round(file.size / 1000)}kb</small> &nbsp;&nbsp;
                    ${
                        (() => {
                            return parent.id ? '' : `
                                <button type="button" class="close" onclick="removeFile('${handler.name}')">
                                    <span aria-hidden="true">&times;</span>
                                </button>`
                        })()
                    }
                </div>
            </div>
        </div>`
}

async function showFolder(handler, parent) {
    parent.innerHTML += `
        <div class="card">
            <div class="card-header" style="background-color: white;">
                <div class="d-flex w-100 justify-content-between" data-toggle="collapse" data-target="#${handler.name}">
                    <div>
                        <p class="mb-1">${handler.name}</p>
                        <small>And some small print.</small>
                    </div>
                    <div>
                        ${
                            (() => {
                                return parent.id ? '' : `
                                    <button type="button" class="close" onclick="removeFile('${handler.name}')">
                                        <span aria-hidden="true">&times;</span>
                                    </button>`
                            })()
                        }
                    </div>
                </div>
            </div>
            <div id="${handler.name}" class="collapse"></div>
        </div>`

    let children = []
    for await (let child of handler.values()) {
        children.push(child)
    }
    await render(children, `#${handler.name}`)
}

async function upload() {
    files.splice(0)
    await recursive(fileHandlers)

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

            if (uploadedSize == totalSize) {
                let url = `${api}/?prefix=${keyBase()}`
                console.log(url)

                fileHandlers = []
                render(fileHandlers)
            }
        }
    }
}

async function recursive(handlers, base = '') {
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
            await recursive(children, key)
        }
    }
}
