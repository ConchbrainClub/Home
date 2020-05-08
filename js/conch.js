request("https://conchbrain.club/articles/page1.json",(result)=>{
    var str = JSON.stringify(result);
    console.log(str);
});