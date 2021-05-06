var favourites = [];

async function showFavourites() {

    if(!userInfo){
        navigation("home");
        return;
    }

    let res = await fetch(`https://storage.conchbrain.workers.dev/${userInfo.id}/get?ConchFavourites`);
    favourites = await res.json();

    document.querySelector("#favouriteList").innerHTML = null;

    if(favourites.length == 0){
        document.querySelector("#favouriteList").innerHTML = "<h2 class='display-6 ml-4'>这里什么也没有</h2>";
        return;
    }

    for(var i=favourites.length-1; i>=0; i--){

        let id = guid();
        let favourite = JSON.parse(favourites[i]);

        let html = `
            <div id="${id}" class="col-md-6 animate__animated animate__bounceIn">
                <div class="card mb-3">
                    <div class="cover">
                        <a href="${favourite.link}" style="background-image:url('${favourite.cover}');" target="_blank"></a>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="${favourite.link}" target="_blank">${favourite.title}</a>
                            <div class="float-right del">
                                <svg onclick="delFavourite('${encodeURI(favourites[i])}','${id}')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </div>
                        </h5>
                        <p class="card-text">${favourite.desc}</p>
                        <p class="card-text">语言：${favourite.language}</p>
                    </div>
                </div>
            </div>
        `;

        document.querySelector("#favouriteList").innerHTML += html;
    }
}

function delFavourite(favourite, id){

    favourite = decodeURI(favourite);

    if(favourites.indexOf(favourite) >= 0)
        favourites.splice(favourites.indexOf(decodeURI(favourite)),1);
    
    toast("收藏", "删除中，请稍候......");
    
    // 保存个人数据
    fetch(`https://storage.conchbrain.workers.dev/${userInfo.id}/set`,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "key": "ConchFavourites",
            "value": favourites
        })
    }).then((res) => {
        if(res.status == 200){
            document.getElementById(id).remove();
            toast("收藏", "删除成功。");
        }
        else
            toast("收藏", "删除失败，请重试。");
    });
}

showFavourites();