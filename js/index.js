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
    let url = "/view/" + name +".html";
    request(url,(data) => {
        if(data!=undefined){
            document.querySelector("#main").innerHTML = data;
            inject();
            url = "#"+name;
            history.pushState({page: name},name,url);
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
        request(src,(data) => {
            if(data==undefined){
                console.log("inject error");
            }
        });
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
    if(href.includes("#")){
        let page = href.substring(href.indexOf("#")+1);
        navigation(page);
    }
    else{
        navigation("home");
    }
}
