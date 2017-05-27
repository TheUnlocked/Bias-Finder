var currentData = {};
var firstParagraph = "";
var confidence = "";

var currentTab;

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
		currentTab = tab;

		simplifiedURL = tab.url.toLowerCase().replace("http://", "https://", 1).replace("www.", "", 1);
		var hardcodeList = {
			"Washington Post": "https://washingtonpost.com/",
			"Yahoo News": "https://yahoo.com/",
			"Associated Press": "https://apnews.com/",
			"Newsweek": "https://newsweek.com/",
			"The Korea Herald": "https://koreaherald.com/",
			"The Advocate-Messenger": "https://amnews.com/",
			"CBN": "https://www1.cbn.com/",
			"CBS ": "https://cbsnews.com/",
			"Wall Street Journal- News": "https://wsj.com/",
			"Newsweek": "https://newsweek.com/",
			"CNN": "cnn.com/" //No http:// in order to add support for CNN's numerous subdomains.
		};

		var biasList = data.filter(function(obj){
			if (obj.news_source in hardcodeList){
				console.log(obj.news_source in hardcodeList);
				return simplifiedURL.includes(hardcodeList[obj.news_source]);
			}
			return simplifiedURL.includes(obj.url.toLowerCase().replace("\\", "").replace("http://", "https://", 1).replace("www.", "", 1));
		});
		currentData = biasList[0];
		if (biasList.length > 0){
			chrome.browserAction.setIcon({path: {"24": images[biasList[0].bias_rating]["img"]}, tabId: tabId});
			chrome.browserAction.setTitle({title: images[biasList[0].bias_rating]["name"] + " - " + biasList[0].news_source, tabId: tabId});
			chrome.browserAction.setPopup({popup: "Popup/info_popup.html",tabId: tabId});
			$.get(currentData.allsides_url.replace("\\", ""), function(data){
				firstParagraph = String(data).split('<div id="content"')[1].split('<p>')[1].split('</p>')[0];
				confidence = String(data).split('<h4>Confidence Level:</h4>')[1].split('<strong class="margin-left-25">')[1].split('</')[0];
			});
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
		sendResponse(firstParagraph);
	}
	else if (message.message == "getConfidence"){
		sendResponse(confidence);
	}
	return true;
});
