$(document).ready(function(){
    console.log("ready");
});

function showPlay(element) {
    $(element).fadeTo(0, 1);
}

function hidePlay(element) {
    $(element).fadeTo(0, 0);
}
