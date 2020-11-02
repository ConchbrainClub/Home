var currentPage = 0;
var config = undefined;

function loadConfig(){
    request("/articles/config.json?" + Math.random(), (result)=>{
        config = result;
        showTimeline();
        loadData(); 
    });
}

function showTimeline(){
    let list = document.querySelector("#timeline > ul");
    list.innerHTML = "";
    let endIndex = config.length-10 > 0 ? 10 : config.length;
    
    for(let i=0; i<endIndex; i++){

        let style = "";
        if(i == currentPage){
            style = "style='color:red;'";
        }

        let html = `
            <li class="list-group-item" ${style} onclick="loadDatePage(${i})">${config[i].date}</li>
        `;

        list.innerHTML += html;
    }
}

function loadDatePage(index){
    document.querySelector("#articles").innerHTML = null;
    currentPage = index;
    loadData();
}

function loadData(){
    
    nextState(true);

    let page = config[currentPage];

    request("/articles/pages/" + page.name + "?" + Math.random(),(result)=>{
        if(result){
            showDate(page.date);
            showData(result);
            showTimeline();

            nextState(false);

            if(currentPage==config.length-1){
                let btn = document.querySelector("#layout button");
                btn.querySelector("span").innerText = "没有更多了";
                btn.setAttribute("disabled","deiabled");
            }
            else{
                let btn = document.querySelector("#layout button");
                btn.querySelector("span").innerText = "加载更多";
            }
        }
    });
}

function showDate(date){
    let html = `
        <div class="col-md-12">
            <h1 class="display-4 m-3">${date}</h1>
        </div>
    `;

    document.querySelector("#articles").innerHTML += html;
}

function getNum(articles){
    return Math.ceil(articles.length/2);
}

function showData(articles){

    articles.forEach(article => {
        let html = `
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="cover">
                        <a href="${article.link}" style="background-image:url('${article.cover}');"></a>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="${article.link}">${article.title}</a>
                        </h5>
                        <p class="card-text">${article.desc}</p>
                        <p class="card-text">语言：${article.language}</p>
                    </div>
                </div>
            </div>
        `;

        document.querySelector("#articles").innerHTML += html;
    });
}

function loadNext(){
    currentPage++;
    loadData();
}

function nextState(flag){
    let btn = document.querySelector("#layout button");
    let loadNext = btn.querySelector("#loadingNext");

    if(flag){
        loadNext.removeAttribute("hidden");
        btn.setAttribute("disabled","deiabled");
    }
    else{
        loadNext.setAttribute("hidden","hidden");
        btn.removeAttribute("disabled");
    }
}

loadConfig();
