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
    loadingState(true);
    document.querySelector("#main").innerHTML = "";
    var url = "/view/" + name +".html";
    request(url,(data) => {
        if(data!=undefined){
            document.querySelector("#main").innerHTML = data;
            inject();
            url = "#"+name;
            history.pushState({page: name},name,url);
            loadingState(false);
        }
        else{
            navigation("home");
            loadingState(false);
        }
    });
}

function loadingState(flag){
    var loadingPage = document.querySelector("#loading");
    if(flag){
        loadingPage.removeAttribute("hidden");
    }
    else{
        loadingPage.setAttribute("hidden","hidden");
    }
}

function inject(){
    document.querySelectorAll("#main > script").forEach(element => {
        var src = element.getAttribute("src");
        request(src,(data) => {
            if(data==undefined){
                console.log("inject error");
            }
        });
    });
}

function init(){
    window.onpopstate = (e)=>{
        navigation(e.state.page);
    }

    var href = window.location.href;
    if(href.includes("#")){
        var page = href.substring(href.indexOf("#")+1);
        navigation(page);
    }
    else{
        navigation("home");
    }
}