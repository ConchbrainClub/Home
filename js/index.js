function navigation(name){
    document.getElementById("main").innerHTML = "";
    var url = "./view/" + name +".html";
    $.ajax({
        type: 'GET',
        url: url,
        success: function(data) {
            document.getElementById("main").innerHTML = data;
        },
        error: function() {
            alert("error");
        }
    });
}

function init(){
    navigation("home");
}