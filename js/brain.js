var containerId = undefined;
var baseUrl = "https://www.ccczg.site/web-terminal"

function create(system){
    if(!containerId){
        window.fetch(baseUrl + "/create?" + system,{
            method:"GET"
        }).then((res)=>{
            if(res.status==200){
                res.text().then((text)=>{
                    containerId = text;
                    tryConnect();
                });
            }
            else{
                alert("出错了,请刷新后重试");
            }
        });
    }
    else{
        kill();
        setTimeout(create,1000,system);
    }
}

function tryConnect(){
    if(containerId){
        var num = Math.round((Math.random()*100000)).toString();
        var str = prompt("请输入"+num);
        if(!str || str==""){
            kill();
        }
        else if(str == num){
            var url = baseUrl + "/" + containerId;
            document.querySelector("#shell").querySelector("iframe").src = url;
        }
        else{
            setTimeout(tryConnect,1000);
        }
    }
    else{
        alert("请先创建环境");
    }
}

function kill(){
    if(containerId){
        fetch(baseUrl + "/kill?" + containerId,{
            method:"GET"
        }).then((res)=>{
            res.text().then((text)=>{
                if(text.includes(containerId)){
                    containerId = undefined;
                    document.querySelector("#shell").querySelector("iframe").src = "";
                }
                else{
                    console.log("kill container defeat");
                }
            });
        });
    }
}

function delay(){
    if(containerId){
        fetch(baseUrl + "/delay?" + containerId,{
            method:"GET"
        }).then((res)=>{
            res.text().then((text)=>{
                console.log(text)
            });
        });
        setTimeout(delay,1000*60);
    }
}

function createContainer(system){
    //创建容器
    create(system);
    //延迟容器生命周期
    delay();
    //离开网页关闭容器
    window.addEventListener('beforeunload',kill);
}

function fullScreen(){
    document.querySelector("#btn_mini").click();
    setTimeout(()=>{
        var iframe = document.querySelector("#shell").querySelector("iframe");
        var fullScreenFrame = document.querySelector("#fullScreenFrame");
        fullScreenFrame.src = iframe.src;
        iframe.src = "";
        fullScreenFrame.removeAttribute("hidden");
    },500);
    document.querySelector(".exitFullScreen").removeAttribute("hidden");
}

function exitFullScreen(){
    var iframe = document.querySelector("#shell").querySelector("iframe");
    var fullScreenFrame = document.querySelector("#fullScreenFrame");
    iframe.src = fullScreenFrame.src;
    fullScreenFrame.src = "";
    fullScreenFrame.setAttribute("hidden","hidden");
    document.querySelector("#showModal").click();
    document.querySelector(".exitFullScreen").setAttribute("hidden","hidden");
}