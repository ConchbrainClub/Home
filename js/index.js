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
    document.querySelector("#main").innerHTML = "";
    var url = "/view/" + name +".html";
    request(url,(data) => {
        if(data!=undefined){
            document.querySelector("#main").innerHTML = data;
            inject();
            url = "#"+name;
            history.pushState({page: name},name,url);
        }
        else{
            navigation("home");
        }
    });
}

function inject(){
    document.querySelectorAll("#main > script").forEach(element => {
        var src = element.getAttribute("src");
        request(src,(data) => {
            if(data!=undefined){
                eval(data);
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