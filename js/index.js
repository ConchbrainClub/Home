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

function getUser(){
    
    let access_token = localStorage.getItem("access_token");

    if(!access_token){
        document.querySelector("#userName").onclick = login;
        return;
    }

    $.ajax({
        type: 'GET',
        url: "https://api.github.com/user",
        headers: {
            accept: 'application/json',
            Authorization: `token ${localStorage.getItem("access_token")}`
        },
        success: (data) => {
            userInfo = data;
            showInfo();
        },
        error: () => {
            alert("登陆失败，请重新登录");
            logout();
        }
    });
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

function navigation(name){

    window.scrollTo(0,0);
    loadingState(true);
    document.querySelector("#main").innerHTML = "";
    let url = "/view/" + name + ".html";
    request(url,(data) => {
        if(data != undefined){
            document.querySelector("#main").innerHTML = data;
            inject();
            url = "#" + name;
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

function init(){
    initMenu();

    window.onscroll = () => {
        // check is top
        if (window.scrollY > 200) {
            document.querySelector(".js-top").classList.add("active");
        }
        else {
            document.querySelector(".js-top").classList.remove("active");
        }
    }

    window.onpopstate = (e)=>{
        navigation(e.state.page);
    }

    let href = window.location.href;

    if(href.includes("#login")){
        let access_token = location.href.substring(location.href.indexOf("?") + 1);
        localStorage.setItem("access_token", access_token);
        window.location.href = "/";
    }

    if(href.includes("#")){
        let page = href.substring(href.indexOf("#")+1);
        navigation(page);
    }
    else{
        navigation("home");
    }

    getUser();
    pushToBaidu();
}
