var currentPage = 1;
var config = undefined;

function loadConfig(){
    request("/articles/config.json",(result)=>{
        config = result;
        loadData(); 
    });
}

function loadData(){
    var realIndex = config.pages.length - currentPage;

    request("/articles/pages/" + config.pages[realIndex].name ,(result)=>{
        if(result){
            showData(result);

            if(realIndex==0){
                var btn = document.querySelector("#layout button");
                btn.innerText = "没有更多了";
                btn.setAttribute("disabled","deiabled");
            }
        }
    });
}

function getNum(articles){
    return Math.ceil(articles.length/2);
}

function showData(articles){
    var rowNum = getNum(articles);

    for(var i=0;i<rowNum;i++){
        var row = document.createElement("div");
        row.className = "row";

        for(var j=0;j<2;j++){

            var index = i*2+j;
            var article = articles[index];

            if(index<articles.length){

                var col = document.createElement("div");
                col.className = "col-md-6";

                var card = document.createElement("div");
                card.className = "card mb-3";

                var cover = document.createElement("div");
                cover.className = "cover";

                var coverlink = document.createElement("a");
                coverlink.href = article.link;
                coverlink.target = "blank";
                coverlink.style.backgroundImage = "url("+ article.cover +")";

                var cardBody = document.createElement("div");
                cardBody.className = "card-body";

                var title = document.createElement("h5");
                title.className = "card-title";

                var link = document.createElement("a");
                link.href = article.link;
                link.target = "blank";
                link.innerText = article.title;
                
                var desc = document.createElement("p");
                desc.className = "card-text";
                desc.innerText = article.desc;
                
                var time = document.createElement("p");
                time.className = "card-text";
                time.innerText = article.time;
                
                title.appendChild(link);

                cardBody.appendChild(title);
                cardBody.appendChild(desc);
                cardBody.appendChild(time);

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

loadConfig();