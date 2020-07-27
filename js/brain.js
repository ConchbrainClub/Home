var containerId = undefined;
var baseUrl = "https://www.ccczg.site/web-terminal"

function create(){
    if(!containerId){
        window.fetch(baseUrl + "/create",{
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
                    document.querySelector("#shell").querySelector("iframe").src = null;
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
    }

    setTimeout(delay,1000*60);
}

function createContainer(){
    //创建容器
    create();
    //延迟容器生命周期
    delay();
    //离开网页关闭容器
    window.addEventListener('beforeunload',kill);
}