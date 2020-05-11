var articlePage = 1;

function loadData(){
    request("/articles/page"+ articlePage +".json",(result)=>{
        if(result){
            showData(result);
            
            checkNextPage((flag)=>{
                if(!flag){
                    var btn = document.querySelector("#layout button");
                    btn.innerText = "没有更多了";
                    btn.setAttribute("disabled","deiabled");
                }
            });
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
                cover.style.backgroundImage = "url("+ article.cover +")"

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

                card.appendChild(cover);
                card.appendChild(cardBody);

                col.appendChild(card);
            }

            row.appendChild(col);

            document.querySelector("#articles").appendChild(row);
        }
    }
}

function checkNextPage(callback){
    var nextPage = articlePage + 1;
    request("/articles/page"+ nextPage +".json",(result)=>{
        if(result){
            callback(true);
        }
        else{
            callback(false);
        }
    });
}

function loadNext(){
    articlePage++;
    loadData();
}

loadData();