$(function(){
    openPopup("nosite");

    $("#confirm_search").click(function(){
        searchSite(document.getElementById("allsides_search").value.toLowerCase());
        browser.tabs.create({url:"https://www.allsides.com/bias/bias-ratings?title=" + document.getElementById("allsides_search").value.split(' ').join('+')});
        window.close();
    });

    $("#allsides_search").keyup(function(event){
        if(event.keyCode == 13){
            $("#confirm_search").click();
        }
    });
});
