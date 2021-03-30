let id = undefined;
var baseUrl = "https://cloudshell.conchbrain.club"

onmessage = (e) => {
    if(e.data && !id)
        id = e.data;
    delay();
}

function delay(){
    if(id){
        fetch(baseUrl + "/delay?" + id,{
            method:"GET"
        }).then((res)=>{
            res.text().then((text)=>{
                console.log(text);
                postMessage("tick");
            });
        });
    }
    setTimeout(delay,1000*60);
}