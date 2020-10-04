let currentPage = 0;
let config = undefined;

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
        let li = document.createElement("li");
        li.className = "list-group-item";
        li.innerText = config[i].date;
        li.setAttribute("onclick","loadDatePage(" + i.toString() + ")");
        if(i==currentPage){
            li.style.color = "red";
        }
        list.appendChild(li);
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
    let element = document.createElement("h1");
    element.className = "display-4 m-3";
    element.innerText = date;
    document.querySelector("#articles").appendChild(element);
}

function getNum(articles){
    return Math.ceil(articles.length/2);
}

function showData(articles){
    let rowNum = getNum(articles);

    for(let i=0;i<rowNum;i++){
        let row = document.createElement("div");
        row.className = "row";

        for(let j=0;j<2;j++){

            let index = i*2+j;
            let article = articles[index];

            if(index<articles.length){

                let col = document.createElement("div");
                col.className = "col-md-6";

                let card = document.createElement("div");
                card.className = "card mb-3";

                let cover = document.createElement("div");
                cover.className = "cover";

                let coverlink = document.createElement("a");
                coverlink.href = article.link;
                coverlink.target = "blank";
                coverlink.style.backgroundImage = "url("+ article.cover +")";

                let cardBody = document.createElement("div");
                cardBody.className = "card-body";

                let title = document.createElement("h5");
                title.className = "card-title";

                let link = document.createElement("a");
                link.href = article.link;
                link.target = "blank";
                link.innerText = article.title;
                
                let desc = document.createElement("p");
                desc.className = "card-text";
                desc.innerText = article.desc;
                
                let lang = document.createElement("p");
                lang.className = "card-text";
                lang.innerText = "语言：" + article.language;
                
                title.appendChild(link);

                cardBody.appendChild(title);
                cardBody.appendChild(desc);
                cardBody.appendChild(lang);

                cover.appendChild(coverlink);

                card.appendChild(cover);
                card.appendChild(cardBody);

                col.appendChild(card);
            }

            row.appendChild(col);

            document.querySelector("#articles").appendChild(row);
        }
    }
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
