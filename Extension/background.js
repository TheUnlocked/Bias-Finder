var currentData = {};
var firstParagraph = "";

$.getJSON('http://www.allsides.com/download/allsides_data.json', function(data) {
	var images = {
		"71": {"img": "Icons/icon-left.png", "name":"Left"},
		"72": {"img": "Icons/icon-leaning-left.png", "name":"Lean Left"},
		"73": {"img": "Icons/icon-center.png", "name":"Center"},
		"74": {"img": "Icons/icon-leaning-right.png", "name":"Lean Right"},
		"75": {"img": "Icons/icon-right.png", "name":"Right"},
		"2707": {"img": "Icons/icon-mixed.png", "name":"Mixed Rating"},
		"2690": {"img": "Icons/icon-not-yet-rated.png", "name":"Not Rated"},
	};

	function switchIcon(tab, tabId){
		var biasList = data.filter(function(obj){
			//Hardcoded Exception
			if (obj.news_source == "Washington Post"){
				return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes("washingtonpost.com");
			}
			if (obj.news_source == "Yahoo News"){
				return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes("yahoo.com");
			}
			if (obj.news_source == "Associated Press"){
				return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes("apnews.com");
			}
			return (tab.url.replace("www.", "").replace("https", "http").toLowerCase() + "/").includes(obj.url.replace("www.", "").replace("https", "http").replace("\\", "").toLowerCase());
		});
		currentData = biasList[0];
		if (biasList.length > 0){
			chrome.browserAction.setIcon({path: {"24": images[biasList[0].bias_rating]["img"]}, tabId: tabId});
			chrome.browserAction.setTitle({title: images[biasList[0].bias_rating]["name"] + " - " + biasList[0].news_source, tabId: tabId});
			$.get(currentData.allsides_url.replace("\\", ""), function(data){
				firstParagraph = String(data).split('<div id="content"')[1].split('<p>')[1].split('</p>')[0];
			});
		}
		else{
			chrome.browserAction.disable(tabId);
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
	else if (message.message == "getFirstParagraph"){
		$.get(currentData.allsides_url.replace("\\", ""), function(data){
			sendResponse(firstParagraph);
		});
	}
	return true;
});
