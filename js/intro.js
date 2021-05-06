function createVideo(){
    
    // 抵消 animate.css 导致模态框被覆盖的 BUG
    document.querySelector("#banners").className = "";
    
    let html = `
    <div class="modal-content">

        <div class="modal-header">
            <h5 class="modal-title h4" id="exampleModalXlLabel">
                <span>ConchBrainClub</span>
            </h5>

            <ul class="nav justify-content-end">
                <button type="button" class="close" data-dismiss="modal" onclick="removeVideo()" aria-label="关闭">
                    <span aria-hidden="true">&times;</span>
                </button>
            </ul>
        </div>

        <iframe class="modal-content" width="800" height="600" allowfullscreen="true" src="https://v.qq.com/txp/iframe/player.html?vid=i054487uic5"></iframe>

    </div>
    `;

    document.querySelector(".modal-dialog").innerHTML = html;
}

function removeVideo(){
    document.querySelector("iframe").remove();
}