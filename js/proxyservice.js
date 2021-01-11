var proxyHref = "https://proxy.conchbrain.workers.dev/-----";

function search(){
    let href = document.querySelector("#link").value;
    if(href){
        window.open(proxyHref + href);
    }
}

function initBackground(){
    let corsProxy = "https://cors.conchbrain.workers.dev/?";
    let api = "https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN";
    request(corsProxy + api,(data) => {
        let bgHref = "https://cn.bing.com" + data.images[0].url;
        console.log(bgHref);
        document.querySelector("#bg").style.backgroundImage = `url("${bgHref}")`;
        document.querySelector("#bg h1").style.color = "white";
    });
}

document.querySelector("input").onkeydown = () => {
    if (window.event.keyCode == 13){
        search();
    }
}

initBackground();
