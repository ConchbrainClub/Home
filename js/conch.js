var currentPage = 0;
var commitId = "";
var pages = undefined;
var favourites = [];

function loadConfig(){
    showLangs();
    request("/articles/config.json?" + Math.random(), (result) => {
        commitId = result.commit;
        pages = result.pages;
        showTimeline();
        loadData();
    });
}

function showTimeline(){
    let list = document.querySelector("#timeline > ul");
    list.innerHTML = "";

    let startIndex = currentPage - 4 < 0 ? 0 : currentPage - 4;
    
    if(startIndex + 9 >= pages.length)
        startIndex = pages.length - 9;
    
    let endIndex = startIndex + 9 < pages.length ? startIndex + 9 : pages.length;

    for(let i = startIndex; i < endIndex; i++){

        let style = "";
        if(i == currentPage){
            style = "style='color:red;'";
        }

        let html = `
            <li class="list-group-item" ${style} onclick="loadDatePage(${i})">${pages[i].date}</li>
        `;

        list.innerHTML += html;
    }
}

function showLangs() {
    request("https://lang.conchbrain.workers.dev/", langs => {
        JSON.parse(langs).forEach(lang => {
            let html = `<li class="nav-item animate__animated animate__flip"><a class="nav-link" onclick="filterByLang('${lang}')">${lang}</a></li>`;
            document.querySelector("#langs").innerHTML += html;
        });
    });
}

async function filterByLang(lang) {

    window.stop();
    nextState(true);
    
    let results = new Array();

    for (let i = 0; i < pages.length; i++) {
        let res = await fetch("/articles/pages/" + pages[i].name);
        let projects = await res.json();

        filter(projects, (project) => {
            return project.language == lang;
        }).forEach(project => {
            results.push(project);
        });
    }

    nextState(false);
    showData(lang, results);
}

function loadDatePage(index){
    window.stop();
    MoveTop();
    currentPage = index;
    loadData();
}

function loadData(){

    nextState(true);
    let page = pages[currentPage];

    request("/articles/pages/" + page.name,(result) => {
        if(!result)
            return;
        nextState(false);
        showData(page.date, result);
        showTimeline();
    });
}

function showInfo(date){
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

function showStar(article, starId) {
    if(favourites.indexOf(JSON.stringify(article)) < 0){
        return `
            <svg onclick="changeFavourite('${encodeURI(JSON.stringify(article))}','${starId}')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
            </svg>
        `;
    }
    return `
        <svg onclick="changeFavourite('${encodeURI(JSON.stringify(article))}','${starId}')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
        </svg>
    `;
}

function showData(date, articles){

    document.querySelector("#articles").innerHTML = null;

    showInfo(date);

    articles.forEach(article => {
        let starId = guid();

        if(!location.href.includes("localhost")){
            article.cover = `https://cdn.jsdelivr.net/gh/conchbrainclub/home@${commitId}${article.cover}`;
        }

        let html = `
            <div class="col-md-6 animate__animated animate__bounceIn">
                <div class="card mb-3">
                    <div class="cover">
                        <a href="${article.link}" style="background-image:url('${article.cover}');" target="_blank"></a>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">
                            <a href="${article.link}" target="_blank">${article.title}</a>
                            <div id="${starId}" class="float-right star">${showStar(article, starId)}</div>
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

function nextState(flag){
    document.querySelector("#articles").innerHTML = null;
    let loadingBox = document.querySelector("#loadingBox");

    if(flag)
        loadingBox.removeAttribute("hidden");
    else
        loadingBox.setAttribute("hidden","hidden");
}

function changeFavourite(favourite,starId) {

    // 用户是否登录
    if(!userInfo){
        alert("登录后才能收藏");
        return;
    }

    favourite = decodeURI(favourite);

    if(favourites.indexOf(favourite) < 0)
        favourites.push(favourite);
    else
        favourites.splice(favourites.indexOf(decodeURI(favourite)),1);

    toast("推荐", "保存中，请稍候......");

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
            document.getElementById(starId).innerHTML = showStar(JSON.parse(decodeURI(favourite)),starId);
            toast("推荐", "保存成功。");
        }
        else
            toast("推荐", "保存失败，请重试。");
    });
}

async function search() {
    window.stop();
    nextState(true);

    let keyword = document.querySelector("#keyword").value.trim();

    if(!keyword){
        alert("搜索内容不能为空");
        return;
    }

    let results = new Array();

    for (let i = 0; i < pages.length; i++) {
        let res = await fetch("/articles/pages/" + pages[i].name);
        let projects = await res.json();

        filter(projects, (project) => {
            return project.title.includes(keyword) || project.desc.includes(keyword);
        }).forEach(project => {
            results.push(project);
        });
    }

    nextState(false);
    showData(keyword, results);
    document.querySelector("#keyword").value = null;
}

function filter(projects, func) {
    let results = new Array();

    projects.forEach(project => {
        if(func(project)){
            results.push(project);
        }
    });

    return results;
}

document.querySelector("input").onkeydown = () => {
    if (window.event.keyCode == 13)
        search();
}

if(userInfo)
    fetch(`https://storage.conchbrain.workers.dev/${userInfo.id}/get?ConchFavourites`).then((res) => {
        if(res.status == 404)
            loadConfig();
        else
            res.json().then((data) => {
                favourites = data;
                loadConfig();
            });
    });
else
    loadConfig();

if(!userInfo)
    toast("推荐", "登录账号后，即可收藏项目推荐。");
else
    toast("推荐", "点击星号，即可收藏项目推荐。");
