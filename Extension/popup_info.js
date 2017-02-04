$(document).ready(function(){
    var target;

    document.getElementById("allsides_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://allsides.com/"});
    });
    document.getElementById("unlocked_link").addEventListener("click",function(){
        chrome.tabs.create({url:"http://twitter.com/The_Unlocked/"});
    });

    function gotoURL(){
        chrome.tabs.create({url:target});
    }

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
                "desc": "This site has either not been databased by <a href=\"#\" id=\"link\">allsides.com</a>, or not enough data about this site's bias has been collected to make an accurate claim. Due to some logisitcal issues, you may be able to find more information about this source at the AllSides website."},
        };
        function generate(data, rating){
            var img = document.createElement("img");
            img.src = ratingObjs[rating].img;
            img.alt = ratingObjs[rating].alt;
            document.getElementById("icon").appendChild(img);
            document.getElementById("desc").innerHTML = ratingObjs[rating].desc;
            if (!jQuery.isEmptyObject(data)){
                if (rating != 2690){
                    document.getElementById("desc").innerHTML += "<br /> <a href=\"#\" id=\"link\">Click here for more information</a>";
                }
                document.getElementById("title").innerHTML = data.news_source;
                target = data.allsides_url;
            }
            else{
                target = "http://www.allsides.com/bias/bias-ratings";
            }
            document.getElementById("link").addEventListener("click",gotoURL);
        }
        if (!jQuery.isEmptyObject(data)){
            generate(data, data.bias_rating);
        }
        else {
            generate(null, 2690);
        }
    });
});
