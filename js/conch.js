function askQuestion() {
    $.ajax({
        type: 'GET',
        url: href,
        success: function(data) {
            document.getElementsByTagName("audio")[0].src = data;
        }
    });
}
