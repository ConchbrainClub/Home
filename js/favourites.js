async function showFavourites() { 
    let res = await fetch(`https://storage.conchbrain.workers.dev/${userInfo.id}/get?ConchFavourites`);
    let data = await res.json();

    document.querySelector("#favouriteList").innerHTML = null;

    data.forEach(favourite => {
        document.querySelector("#favouriteList").innerHTML += JSON.stringify(favourite);
    });
}

showFavourites();