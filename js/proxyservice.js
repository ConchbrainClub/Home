var proxyHref = "https://proxy.conchbrain.workers.dev/-----";
var searchHref = "https://proxy.conchbrain.workers.dev/-----https://duckduckgo.com/?q=";

function search(){
    let href = document.querySelector("#link").value;
    if(href){
        if(isHref(href)){
            window.open(proxyHref + href);
        }
        else{
            window.open(searchHref + href);
        }
    }
}

function setBackground(bgHref){
    document.querySelector("#bg").style.backgroundImage = `url("${bgHref}")`;
    document.querySelector("#bg h1").style.color = "white";
}

function initBackground(){
    let date = new Date().getDate().toString();
    let lastDate = localStorage.getItem("lastDate");

    if(lastDate == date){
        setBackground(localStorage.getItem("bg"));
        return;
    }

    let corsProxy = "https://cors.conchbrain.workers.dev/?";
    let api = "https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";
    request(corsProxy + api,(data) => {
        let bgHref = "https://cn.bing.com" + data.images[0].url;
        setBackground(bgHref);

        localStorage.setItem("lastDate",date);
        localStorage.setItem("bg", bgHref);
    });
}

function isHref(href){
    var reg = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*$/;
    return reg.test(href);
}

document.querySelector("input").onkeydown = () => {
    if (window.event.keyCode == 13)
        search();
}

initBackground();
