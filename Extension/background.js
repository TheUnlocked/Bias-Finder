import NewsSource from "./types/NewsSource.js";

let currentSite = {};
let firstParagraph = "";
let confidence = "";

let currentTab;

const hardcodeList = {
	"Washington Post": "https://washingtonpost.com/",
	"Yahoo News": "https://yahoo.com/",
	"Associated Press": "https://apnews.com/",
	"Newsweek": "https://newsweek.com/",
	"The Korea Herald": "https://koreaherald.com/",
	"The Advocate-Messenger": "https://amnews.com/",
	"CBN": "https://www1.cbn.com/",
	"CBS ": "https://cbsnews.com/",
	"Wall Street Journal- News": "https://wsj.com/",
	"CNN": "cnn.com/", //No https:// in order to add support for CNN's numerous subdomains.
};


$(() => {
	postVersionInfo();

	/**
	 * @type {NewsSource[]} siteList
	 */
	let siteList = [];
	function addSite(siteData){
		siteList.push(new NewsSource(
			siteData.news_source,
			siteData.allsides_url.replace('\\', ''),
			siteData.url,
			siteData.bias_rating
		));
	}
	function addSites(sitesData){
		sitesData.forEach(siteData => {
			addSite(siteData);
		});
	}

	$.getJSON('https://gist.githubusercontent.com/TheUnlocked/42be5e01eaad902415bf4c23224a8679/raw/biasfinder_data.json')
	.then(addSites)
	.then(() => $.getJSON('http://www.allsides.com/download/allsides_data.json'))
	.then(addSites)
	.then(() => {
		let switchIcon = (tab, tabId) => {
			siteList = siteList.filter(obj => obj.sourceName != "Test Source");

			currentTab = tab;

			let biasList = siteList.filter(function(site){
				return site.test(tab.url);
			});
			if (biasList.length > 0){
				currentSite = biasList.filter((obj) => obj.forced)[0] || biasList[biasList.length - 1];

				chrome.browserAction.setIcon({"path": {"24": currentSite.biasImage}, "tabId": tabId});
				chrome.browserAction.setTitle({"title": currentSite.sourceName + " - " + NewsSource.BIASNAMES[currentSite.biasRating], "tabId": tabId});
				$.get(currentSite.allsidesUrl, function(data){
					let dataText = String(data);
					firstParagraph = dataText.split('<div id="content"', 2)[1].split('<p>', 2)[1].split('</p>', 1)[0];
					confidence = dataText.split('<h4>Confidence Level:</h4>', 2)[1].split('<strong class="margin-left-25">')[1].split('</', 1)[0];
					let biasString = dataText.split('<span class="bias-value">', 2)[1].split('</', 1)[0];
					if (biasString && biasString != NewsSource.BIASNAMES[currentSite.biasRating]){
						currentSite.biasRating = NewsSource.BIASES[biasString.toUpperCase()];
						chrome.browserAction.setIcon({"path": {"24": currentSite.biasImage}, "tabId": tabId});
						chrome.browserAction.setTitle({"title": currentSite.sourceName + " - " + NewsSource.BIASNAMES[currentSite.biasRating], "tabId": tabId});
					}
					currentSite.sourceName = dataText.split('<div class="span4 source-image-wrapper News Media">', 2)[1].split('<h2>', 2)[1].split('</', 1)[0];

					gotoSite(currentSite.siteUrl, NewsSource.BIASNAMES[currentSite.biasRating]);
				});
			}
		};
		chrome.tabs.onActivated.addListener(function(info){
			chrome.tabs.get(info.tabId, function(tab){
				switchIcon(tab, info.tabId);
			});
		});
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			switchIcon(tab, tabId);
		});
	});
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
	if (message.message == "getinfo"){
		sendResponse(currentSite);
	}
	else if (message.message == "getFirstParagraph"){
		sendResponse(firstParagraph);
	}
	else if (message.message == "getConfidence"){
		sendResponse(confidence);
	}
	return true;
});
