var currentData = {};

$.getJSON('http://www.allsides.com/download/allsides_data.json', function(data) {
	var images = {
		"71": {"img": "Icons/icon-left.png"},
		"72": {"img": "Icons/icon-leaning-left.png"},
		"73": {"img": "Icons/icon-center.png"},
		"74": {"img": "Icons/icon-leaning-right.png"},
		"75": {"img": "Icons/icon-right.png"},
		"2707": {"img": "Icons/icon-mixed.png"},
		"2690": {"img": "Icons/icon-not-yet-rated.png"},
	};

	function switchIcon(tab, tabId){
		var biasList = data.filter(function(obj){
			//Hardcoded Exception
			if (obj.news_source == "Washington Post"){
				return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes("washingtonpost.com");
			}
			return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes(obj.url.replace("www.", "").replace("https", "http").replace("\\", "").toLowerCase());
		});
		currentData = biasList[0];
		if (biasList.length > 0){
			chrome.browserAction.setIcon({path: {"24": images[biasList[0]["bias_rating"]]["img"]}, tabId: tabId});
		}
		else{
			chrome.browserAction.setIcon({path: {"24": images[2690]["img"]}, tabId: tabId});
		}
	}
	chrome.tabs.onActivated.addListener(function(info){
		chrome.tabs.get(info.tabId, function(tab){
			switchIcon(tab, info.tabId);
		});
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		switchIcon(tab, tabId);
	});
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
	if (message.message == "getinfo"){
		sendResponse(currentData);
	}
});
