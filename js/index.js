let client_id = "68fd42deb929a87fc8b9"
let userInfo = undefined
let isDarkMode = false
let onNavigated = undefined

function login() {
    let redirect_uri = `https://oauth.conchbrain.club/redirect?url=${new URL(location.href).origin}#login`
    let href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`
    location.href = href
}

function logout() {
    localStorage.removeItem("access_token")
    location.reload()
}

async function getUser() {

    let access_token = localStorage.getItem("access_token")

    if (!access_token) {
        document.querySelector("#userName").onclick = login
        return
    }

    let res = await fetch("https://api.github.com/user", {
        headers: {
            accept: 'application/json',
            Authorization: `token ${localStorage.getItem("access_token")}`
        }
    })

    if (res.status == 200) {
        userInfo = await res.json()
        showInfo()
    }
    else {
        alert("登陆失败，请重新登录")
        logout()
    }
}

function showInfo() {
    document.querySelector("#userName").setAttribute("data-toggle", "dropdown")
    document.querySelector("#userName").classList.add("dropdown-toggle")
    document.querySelector("#userName").innerText = userInfo.login
}

function request(href, callback) {
    $.ajax({
        type: 'GET',
        url: href,
        success: (data) => {
            callback(data)
        },
        error: () => {
            callback(undefined)
        }
    })
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

function navigate(name, isBack = false) {

    window.scrollTo(0, 0)
    loadingState(true)
    document.querySelector("#main").innerHTML = ""
    let url = "/view/" + name.split("/")[0] + ".html"

    request(url, (data) => {
        if (data != undefined) {
            document.querySelector("#main").innerHTML = data
            inject()
            url = "#" + name
            if (!isBack)
                history.pushState({ page: name }, name, url)
            loadingState(false)
        }
        else {
            navigate("notfound")
            loadingState(false)
        }
        if (onNavigated) onNavigated(name, isBack)
    })
}

function loadingState(flag) {
    let loadingPage = document.querySelector("#loading")
    if (flag) {
        loadingPage.removeAttribute("hidden")
    }
    else {
        loadingPage.setAttribute("hidden", "hidden")
    }
}

function inject() {
    document.querySelectorAll("#main > script").forEach(element => {
        let src = element.getAttribute("src")
        if (src) {
            request(src, (data) => { })
        }
        else {
            eval(element.innerText)
        }
    })
}

function initMenu() {
    if (window.innerWidth <= 992) {
        document.querySelectorAll(".nav-item").forEach(element => {
            element.setAttribute("data-toggle", "collapse")
            element.setAttribute("data-target", "#navbar")
        })
    }
}
window.addEventListener('resize', () => {
    document.querySelectorAll(".nav-item").forEach(element => {
        if (window.innerWidth <= 992) {
            element.setAttribute("data-toggle", "collapse")
            element.setAttribute("data-target", "#navbar")
        } else {
            element.removeAttribute("data-toggle")
            element.removeAttribute("data-target")
        }
    })
})

async function initPWA() {
    if (location.href.startsWith('http://')) return
    if (!('serviceWorker' in navigator)) return

    let registration = await navigator.serviceWorker.register('./serviceworker.js')

    registration.onupdatefound = () => {
        let installingWorker = registration.installing

        registration.installing.onstatechange = () => {
            if (installingWorker.state != 'installed') return

            if (!localStorage.getItem('isInstalled')) {
                console.log('first install')
                localStorage.setItem('isInstalled', 'true')
                return
            }

            if (confirm('新版本可用，立即更新？')) {
                registration.waiting.postMessage('SKIP_WAITING')
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            }
        }
    }
}

function MoveTop() {
    $("html,body").animate({ scrollTop: 0 }, 500)
}

function toast(title, content) {

    let toastId = guid()

    let html = `
        <div id="${toastId}" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
            <img src="/favicon.ico" height="20" width="20" class="rounded mr-2">
            <strong class="mr-auto">${title}</strong>
            <button type="button" class="ml-2 mb-1 close" aria-label="Close" onclick="closeToast('${toastId}')">
                <span aria-hidden="true">×</span>
            </button>
            </div>
            <div class="toast-body">
                ${content}
            </div>
        </div>
    `
    document.querySelector("#toastArea").innerHTML += html

    setTimeout(closeToast, 8000, toastId)
}

function closeToast(toastId) {
    let toast = document.getElementById(toastId)
    if (toast)
        toast.remove()
}

async function init() {
    //初始化菜单
    initMenu()

    //初始化backtop
    window.onscroll = () => {
        // check is top
        if (window.scrollY > 200) {
            document.querySelector(".js-top").classList.add("active")
        }
        else {
            document.querySelector(".js-top").classList.remove("active")
        }
    }

    //初始化导航
    window.onpopstate = (e) => {
        navigate(e.target.location.hash.substring(1), true)
    }

    //获取当前用户
    getUser()

    //获取当前地址
    let href = window.location.href

    //判断是否授权登陆
    if (href.includes("#login")) {
        let access_token = location.href.substring(location.href.indexOf("?") + 1)
        localStorage.setItem("access_token", access_token)
        window.location.href = "/"
    }

    //导航到指定页面
    if (href.includes("#")) {
        let page = href.substring(href.indexOf("#") + 1)
        navigate(page)
    }
    else {
        navigate("home")
    }

    initPWA()
}
