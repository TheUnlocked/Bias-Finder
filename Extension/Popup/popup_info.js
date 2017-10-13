var maxWords = 60;

$(function(){
    var target;

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
            "desc": "This site has not yet been rated."}
    };

    browser.runtime.sendMessage({"message": "getinfo"}, function(data){
        function generate(data, rating){
            if ("forced" in data && data["forced"]){
                document.getElementById("disclaimer").classList.remove("hidden");
            }
            if (document.getElementById("icon").innerHTML == ""){
                var img = document.createElement("img");
                img.src = ratingObjs[rating].img;
                img.alt = ratingObjs[rating].alt;
                document.getElementById("icon").appendChild(img);
            }
            document.getElementById("desc").innerHTML = ratingObjs[rating].desc;
            if (!jQuery.isEmptyObject(data)){
                if (rating != 2690){
                    browser.runtime.sendMessage({"message": "getFirstParagraph"}, function(firstParagraph){
                        browser.runtime.sendMessage({"message": "getConfidence"}, function(confidence){
                            document.getElementById("confidence").innerHTML = confidence;
                            var shortened = "";
                            if (!firstParagraph.startsWith("The AllSides Bias RatingTM reflects the average judgment of the American people.")){
                                var separated = firstParagraph.split(" ");
                                shortened = separated.splice(0,maxWords).join(" ") + "..." + "<br />";
                                separated = shortened.split('<a');
                                for (var i = 0; i < separated.length; i++){
                                    if (i % 2 == 1){
                                        separated[i] = separated[i].split('>', 1)
                                    }
                                }
                            }
                            document.getElementById("site_desc").innerHTML = shortened + '<a href=\"#\" id=\"link\">Click here for more information</a>';
                            $("#site_desc").find("a").replaceWith(function() {
                                return $(this).attr('id') == "link" ? $(this) : $(this).contents();
                            });

                            target = data.allsides_url;
                            document.getElementById("link").addEventListener("click", function(){
                                browser.tabs.create({url:target});
                            });
                            if (firstParagraph == "" || confidence == "" || (firstParagraph.includes('<strong>') && !data.news_source.includes("AllSides"))){
                                console.log("Failed to get all data on first attempt. Retrying...");
                                setTimeout(function (){
                                    generate(data, rating);
                                }, 100);
                            }
                        });
                    });
                }
                else{
                    document.getElementById("site_desc").innerHTML =  '<a href=\"#\" id=\"link\">Click here for more information</a>';
                    target = data.allsides_url;
                    document.getElementById("link").addEventListener("click", function(){
                        browser.tabs.create({url:target});
                        clickLink("moreInfo");
                    });
                }
                document.getElementById("title").innerHTML = data.news_source;
                openPopup(data.news_source);
            }
            else{
                target = "http://www.allsides.com/bias/bias-ratings";
                document.getElementById("link").addEventListener("click", function(){
                    browser.tabs.create({url:target});
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
