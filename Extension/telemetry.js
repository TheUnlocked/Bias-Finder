var buffer = [];

var category = "Release";

function openPopup(site){
    buffer.push({
        hitType: 'event',
        eventCategory: category,
        eventAction: 'popupOpen',
        eventLabel: site
    });

    pushBuffer();
}

function clickLink(link){
    buffer.push({
        hitType: 'event',
        eventCategory: category,
        eventAction: 'linkClicked',
        eventLabel: link
    });

    pushBuffer();
}

function gotoSite(site, leaning){
    buffer.push({
        hitType: 'event',
        eventCategory: category,
        eventAction: 'siteVisited',
        eventLabel: site
    });
    buffer.push({
        hitType: 'event',
        eventCategory: category,
        eventAction: 'siteVisitedLean',
        eventLabel: leaning
    });

    pushBuffer();
    pushBuffer();
}

function searchSite(term){
    buffer.push({
        hitType: 'event',
        eventCategory: category,
        eventAction: 'search',
        eventLabel: term
    });

    pushBuffer();
}

function postVersionInfo(){
    chrome.storage.sync.get("postedVersion", function(items){
        if (!("postedVersion" in items) || items["postedVersion"] != chrome.runtime.getManifest().version){

            chrome.storage.sync.set({"postedVersion": chrome.app.getDetails().version});

            buffer.push({
                hitType: 'event',
                eventCategory: category,
                eventAction: 'versionInfo',
                eventLabel: chrome.app.getDetails().version
            });

            pushBuffer();
        }
    });
}

function pushBuffer(){}

chrome.storage.sync.get("enableTelemetry", function(items){
    var enabled = true;

    if ("enableTelemetry" in items){
        enabled = items["enableTelemetry"];
    }
    else{
        chrome.storage.sync.set({"enableTelemetry": true});
        enabled = true;
    }

    if (enabled){
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-100491583-1', 'auto');
        ga('set', 'checkProtocolTask', null);

        pushBuffer = function(){ ga('send', buffer.pop()); };
        while (buffer.length > 0){
            pushBuffer();
        }
    }
});
