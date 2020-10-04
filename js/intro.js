function createVideo(){
    let video = document.createElement("iframe");
    video.classList.add("modal-content");
    video.setAttribute("width","800");
    video.setAttribute("height","600");
    video.setAttribute("allowfullscreen","true");
    video.setAttribute("src","https://jx.618g.com/m3u8-dp.php?url=https://ifeng.com-v-ifeng.com/20180712/19376_e9b30d57/index.m3u8");
    document.querySelector(".modal-dialog").appendChild(video);
}

function removeVideo(){
    document.querySelector("iframe").remove();
}