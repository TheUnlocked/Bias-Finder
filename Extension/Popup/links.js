$(document).ready(function(){
    document.getElementById("allsides_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://allsides.com/"});
        clickLink("allsides");
    });
    document.getElementById("unlocked_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://twitter.com/The_Unlocked/"});
        clickLink("twitter");
    });
    if (document.getElementById("unlocked_link_hyper") != null)
        document.getElementById("unlocked_link_hyper").addEventListener("click",function(){
            chrome.tabs.create({url:"http://twitter.com/The_Unlocked/"});
            clickLink("twitter");
        });
    document.getElementById("review_link").addEventListener("click",function(){
        chrome.tabs.create({url:"https://chrome.google.com/webstore/detail/bias-finder/jojjlkfeofgcjeanbpghcapjcccbakop/reviews"});
        clickLink("writeReview");
    });
    document.getElementById("settings_link").addEventListener("click",function(){
        chrome.tabs.create({url:"chrome://extensions/?options=" + chrome.runtime.id});
        clickLink("settings");
    });
});
