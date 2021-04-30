let scripts = [];
let baiduPushLink = "http://data.zz.baidu.com/urls?site=https://conchbrain.club&token=5ZG2x3hnCmpkN4Qh";
let client_id = "68fd42deb929a87fc8b9";
let redirect_uri = "https://oauth.conchbrain.workers.dev/redirect";
let siteMap = `
    https://conchbrain.club/#home
    https://conchbrain.club/#intro
    https://conchbrain.club/#conch
    https://conchbrain.club/#cloudshell
    https://conchbrain.club/#kvstorage
    https://conchbrain.club/#corsproxy
    https://conchbrain.club/#proxyservice
`;
let userInfo = undefined;
let isDarkMode = false;

function switchTheme() {
    isDarkMode = !isDarkMode;
    setTheme();
}

function setTheme() {
    if(isDarkMode){
        DarkReader.setFetchMethod(window.fetch); 
        DarkReader.enable();
        document.querySelector(".logo").src = "./favicon-light.ico";
        localStorage.setItem("isDarkMode",isDarkMode);
    }
    else{
        DarkReader.disable();
        document.querySelector(".logo").src = "./favicon.ico";
        localStorage.removeItem("isDarkMode");
    }
}

function pushToBaidu(){
    fetch("https://cors.conchbrain.workers.dev/?" + baiduPushLink,{
        method: "POST",
        body: siteMap
    });
}

function login() {
    let href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
    location.href = href;
}

function logout(){
    localStorage.removeItem("access_token");
    location.reload();
}

async function getUser(){

    let access_token = localStorage.getItem("access_token");

    if(!access_token){
        document.querySelector("#userName").onclick = login;
        return;
    }

    let res = await fetch("https://api.github.com/user",{
        headers: {
            accept: 'application/json',
            Authorization: `token ${localStorage.getItem("access_token")}`
        }
    });
    
    if(res.status == 200){
        userInfo = await res.json();
        showInfo();
    }
    else{
        alert("登陆失败，请重新登录");
        logout();
    }
}

function showInfo(){
    document.querySelector("#userName").setAttribute("data-toggle", "dropdown");
    document.querySelector("#userName").classList.add("dropdown-toggle");
    document.querySelector("#userName").innerText = userInfo.name;
}

function request(href,callback){
    $.ajax({
        type: 'GET',
        url: href,
        success: (data) => {
            callback(data);
        },
        error: () => {
            callback(undefined);
        }
    });
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function navigation(name,isBack = false){

    window.scrollTo(0,0);
    loadingState(true);
    document.querySelector("#main").innerHTML = "";
    let url = "/view/" + name + ".html";
    request(url,(data) => {
        if(data != undefined){
            document.querySelector("#main").innerHTML = data;
            inject();
            url = "#" + name;
            if(!isBack)
                history.pushState({page: name}, name, url);
            loadingState(false);
        }
        else{
            navigation("notfound");
            loadingState(false);
        }
    });
}

function loadingState(flag){
    let loadingPage = document.querySelector("#loading");
    if(flag){
        loadingPage.removeAttribute("hidden");
    }
    else{
        loadingPage.setAttribute("hidden","hidden");
    }
}

function inject(){
    document.querySelectorAll("#main > script").forEach(element => {
        let src = element.getAttribute("src");
        request(src,(data) => {});
    });
}

function initMenu(){
    document.querySelectorAll(".nav-item").forEach(element => {
        element.setAttribute("data-toggle","collapse");
        element.setAttribute("data-target","#navbar");
    });
}

function MoveTop()
{
	$("html,body").animate({ scrollTop: 0 }, 500);
}

function toast(title, content) {

    let toastId = guid();
    
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
    `;
    document.querySelector("#toastArea").innerHTML += html;

    setTimeout(closeToast, 8000, toastId);
}

function closeToast(toastId) {
    let toast = document.getElementById(toastId);
    if(toast)
        toast.remove();
}

async function init(){
    //初始化菜单
    initMenu();

    //初始化backtop
    window.onscroll = () => {
        // check is top
        if (window.scrollY > 200) {
            document.querySelector(".js-top").classList.add("active");
        }
        else {
            document.querySelector(".js-top").classList.remove("active");
        }
    }

    //初始化导航
    window.onpopstate = (e)=>{
        navigation(e.state.page, true);
    }

    //初始化主题
    isDarkMode = localStorage.getItem("isDarkMode");
    //setTheme();    

    //获取当前用户
    await getUser();

    //判断是否授权登陆
    let href = window.location.href;

    if(href.includes("#login")){
        let access_token = location.href.substring(location.href.indexOf("?") + 1);
        localStorage.setItem("access_token", access_token);
        window.location.href = "/";
    }

    //导航到指定页面
    if(href.includes("#")){
        let page = href.substring(href.indexOf("#")+1);
        navigation(page);
    }
    else{
        navigation("home");
    }

    //推送到百度
    pushToBaidu();
}
