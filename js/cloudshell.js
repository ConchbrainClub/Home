var container = {
    id: undefined,
    system: undefined,
    time: undefined
}
var worker,forward = [];

var baseUrl = "https://cloudshell.conchbrain.club"

function create(system){

    // 抵消 animate.css 导致模态框被覆盖的 BUG
    try {
        document.querySelector("#systemList").className = "";
    } catch (error) {}
    
    if(!container.id){
        window.fetch(baseUrl + "/create?" + system,{
            method:"GET"
        }).then((res)=>{
            if(res.status==200){
                res.text().then((text)=>{
                    container.id = text;
                    container.system = system;
                    container.time = -1;

                    //延迟容器生命周期
                    worker = new Worker("./js/cloudshell_worker.js");
                    worker.postMessage(container.id);
                    worker.onmessage = () => {
                        container.time++;
                    };
                    document.querySelector("#loadingStatus").setAttribute("hidden","hidden");
                    setTimeout(tryConnect,500);
                });
            }
            else{
                alert("出错了,请刷新后重试");
            }
        });
    }
    else{
        alert("请先关闭当前运行中的环境");
    }
}

function tryConnect(){
    if(container.id){
        let num = Math.round((Math.random()*100000)).toString();
        let str = prompt("请输入"+num);
        if(!str || str==""){
            kill();
            $("#shell").modal("toggle");
        }
        else if(str == num){
            let url = `${baseUrl}/${container.id}/`;;
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
    if(container.id){
        fetch(baseUrl + "/kill?" + container.id,{
            method:"GET"
        }).then((res)=>{
            if(res.status == 200){
                document.querySelector("#shell").querySelector("iframe").src = "";
                container.id = undefined;
                forward = [];
                worker.terminate();
                document.querySelector("#loadingStatus").removeAttribute("hidden");
            }
            else{
                console.log("kill container defeat");
            }
        });
    }
}

function createContainer(system){
    
    // 用户是否登录
    if(!userInfo){
        alert("登录后才能使用");
        return;
    }

    document.querySelectorAll(".system").forEach(ele => {
        ele.setAttribute("data-target", "#shell");
    });

    //创建容器
    create(system);
    //离开网页关闭容器
    window.addEventListener('beforeunload',kill);
}

function fullScreen(){
    document.querySelector("#btn_mini").click();
    setTimeout(()=>{
        let iframe = document.querySelector("#shell").querySelector("iframe");
        let fullScreenFrame = document.querySelector("#fullScreenFrame");
        fullScreenFrame.src = iframe.src;
        iframe.src = "";
        fullScreenFrame.removeAttribute("hidden");
    },500);
    document.querySelector(".exitFullScreen").removeAttribute("hidden");
    document.querySelector("nav").setAttribute("hidden","hidden");
}

function exitFullScreen(){
    let iframe = document.querySelector("#shell").querySelector("iframe");
    let fullScreenFrame = document.querySelector("#fullScreenFrame");
    iframe.src = fullScreenFrame.src;
    fullScreenFrame.src = "";
    fullScreenFrame.setAttribute("hidden","hidden");
    document.querySelector("#showModal").click();
    document.querySelector(".exitFullScreen").setAttribute("hidden","hidden");
    document.querySelector("nav").removeAttribute("hidden");
}

function reconnect(){
    let url = baseUrl + "/" + container.id;
    document.querySelector("#shell").querySelector("iframe").src = url;
}

function forwardPort(){
    let port = document.querySelector("#port").value;
    if(!isNaN(port)){
        fetch(`${baseUrl}/forward?id=${container.id}&port=${port}`).then((res) => {
            if(res.status == 200){
                alert("转发端口成功");
                forward.push(port);
            }
            else{
                alert("转发端口失败");
            }
        });
    }
    document.querySelector("#port").value = undefined;
}

function showRunning(){
    if(container.id){
        //显示当前运行状态
        document.querySelector("#running").removeAttribute("hidden");
        document.querySelector("#containerSystem").innerText = container.system;
        document.querySelector("#containerId").innerText = container.id;
        document.querySelector("#containerTime").innerText = container.time + " min ago";

        //显示端口转发状态
        let forwardHtml = "";
        forward.forEach((port) => {
            let url = `${baseUrl}/forward/${container.id}/${port}`;
            forwardHtml += `
                <p class="card-text">
                    ${port} -> <a target="_blank" href="${url}">${url}</a>
                </p>
            `;
        });
        document.querySelector("#forwardPorts").innerHTML = forwardHtml;
    }
    else{
        try {
            document.querySelector("#running").setAttribute("hidden","hidden");
        } catch (error) {}
    }
    setTimeout(showRunning,2000);
}

showRunning();

if(!userInfo)
    toast("CloudShell", "登录后，即可使用 CloudShell 的全部功能。");
else
    toast("CloudShell", "端口转发功能已经可用，快去试试吧。");
