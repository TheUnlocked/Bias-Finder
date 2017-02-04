var maxWords = 80;

$(document).ready(function(){
    var target;

    document.getElementById("allsides_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://allsides.com/"});
    });
    document.getElementById("unlocked_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://twitter.com/The_Unlocked/"});
    });

    chrome.runtime.sendMessage({"message": "getinfo"}, function(data){
        var ratingObjs = {
            "71": {"img": "Icons/bias-left.png", "alt": "Left bias",
                "desc": "This site tends to be biased to the left. This trend reflects the site as a whole and not any specific article."},
            "72": {"img": "Icons/bias-leaning-left.png", "alt": "Leaning left bias",
                "desc": "This site tends to be slightly biased to the left. This trend reflects the site as a whole and not any specific article."},
            "73": {"img": "Icons/bias-center.png", "alt": "Center bias",
                "desc": "This site tends to be centrally aligned. This trend reflects the site as a whole and not any specific article."},
            "74": {"img": "Icons/bias-leaning-right.png", "alt": "Leaning right bias",
                "desc": "This site tends to be slightly biased to the right. This trend reflects the site as a whole and not any specific article."},
            "75": {"img": "Icons/bias-right.png", "alt": "Right bias",
                "desc": "This site tends to be biased to the right. This trend reflects the site as a whole and not any specific article."},
            "2707": {"img": "Icons/bias-mixed.png", "alt": "Mixed bias",
                "desc": "This site has a very mixed alignment, or simply doesn't fall on the left/right partisanship scale."},
            "2690": {"img": "Icons/bias-not-yet-rated.png", "alt": "Site not rated",
                "desc": "This site has either not been databased by <a href=\"#\" id=\"link\">allsides.com</a>, or not enough data about this site's bias has been collected to make an accurate claim."},
        };
        function generate(data, rating){
            var img = document.createElement("img");
            img.src = ratingObjs[rating].img;
            img.alt = ratingObjs[rating].alt;
            document.getElementById("icon").appendChild(img);
            document.getElementById("desc").innerHTML = ratingObjs[rating].desc;
            if (!jQuery.isEmptyObject(data)){
                if (rating != 2690){
                    chrome.runtime.sendMessage({"message": "getFirstParagraph"}, function(response){
                        var separated = response.split(" ");
                        var shortened = separated.splice(0,maxWords).join(" ") + ((separated.length < maxWords) ? "..." : "");
                        document.getElementById("site_desc").classList.remove("hidden");
                        document.getElementById("site_desc").innerHTML = shortened + '<br /> <a href=\"#\" id=\"link\">Click here for more information</a>';
                        target = data.allsides_url;
                        document.getElementById("link").addEventListener("click", function(){
                            chrome.tabs.create({url:target});
                        });
                    });
                }
                else{
                    target = "http://www.allsides.com/bias/bias-ratings";
                    document.getElementById("link").addEventListener("click", function(){
                        chrome.tabs.create({url:target});
                    });
                }
                document.getElementById("title").innerHTML = data.news_source;
            }
            else{
                target = "http://www.allsides.com/bias/bias-ratings";
                document.getElementById("link").addEventListener("click", function(){
                    chrome.tabs.create({url:target});
                });
            }
        }
        if (!jQuery.isEmptyObject(data)){
            generate(data, data.bias_rating);
        }
        else {
            generate(null, 2690);
        }
    });
});
