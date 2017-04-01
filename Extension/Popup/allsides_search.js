$(document).ready(function(){
    document.getElementById("confirm_search").addEventListener("click",function(){
        chrome.tabs.create({url:"https://www.allsides.com/bias/bias-ratings?title=" + document.getElementById("allsides_search").value.split(' ').join('+')});
    });

    $("#allsides_search").keyup(function(event){
        if(event.keyCode == 13){
            $("#confirm_search").click();
        }
    });
});
