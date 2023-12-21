// @ts-check

/** @type {Record<import("./types").BiasRating, { img: string }>} */
const images = {
	"Left": { "img": "Icons/icon-left.png" },
	"Lean Left": { "img": "Icons/icon-leaning-left.png" },
	"Center": { "img": "Icons/icon-center.png" },
	"Lean Right": { "img": "Icons/icon-leaning-right.png" },
	"Right": { "img": "Icons/icon-right.png" },
	"Mixed": { "img": "Icons/icon-mixed.png" },
	"Not Rated": { "img": "Icons/icon-not-yet-rated.png" },
};

/**
 * @returns {Promise<import("./types").AllSidesDataFeed>}
 */
async function getAllSidesData() {
	try {
		return await (await fetch('https://www.allsides.com/media-bias/json/noncommercial/publications')).json();
	}
	catch (e) {
		console.error('Failed to fetch AllSides data!');
		console.error(e);
		return { allsides_media_bias_ratings: [] };
	}
}

/**
 * @param {import("./types").NewsSource | undefined} source 
 * @returns {Promise<import("./types").RequestContextResponse>}
 */
async function fetchContext(source) {
	/** @type {import("./types").RequestContextResponse} */
	let result = {
		type: 'requestContext',
	};

	if (!source) {
		return result;
	}

	const doc = await (async () => {
		try {
			const html = await (await fetch(source.publication.allsides_url)).text();
			const doc = new DOMParser().parseFromString(html, 'text/html');
			return doc;
		}
		catch (e) {
			console.error('Failed to fetch AllSides page for ', source);
			console.error(e);
		}
	})();

	if (doc) {
		// Fetching the paragraph is disabled for now
		// result.firstParagraph = html.split('<div id="content"', 2)[1].split('<p>', 2)[1].split('</p>', 1)[0];
	
		const confidenceContainer = doc.querySelector('#source-page-top :has(.confidence-low, .confidence-medium, .confidence-high');
		if (confidenceContainer) {
			result.confidence = [
				'Low',
				'Medium',
				'High'
			][['confidence-low', 'confidence-medium', 'confidence-high'].findIndex(c => confidenceContainer.classList.contains(c))];
		}
	}

	return result;
}

/**
 * @param {import("./types").NewsSource[]} sources 
 * @param {URL} url
 * @returns {import("./types").NewsSource} 
 */
function findBestSource(sources, url) {
	const simplifiedURL = url.toString().toLowerCase().replace("http://", "https://").replace("www.", "");

	const biasList = sources.filter(source => {
		if (!source.publication.source_url || source.publication.source_url === ""){
			return false;
		}

		return simplifiedURL.includes(source.publication.source_url.toLowerCase().replace("\\", "").replace("http://", "https://").replace("www.", ""));
	});

	return biasList[0];
}

/**
 * 
 * @param {chrome.tabs.Tab | undefined} tab 
 * @returns {Promise<import("./types").NewsSource | undefined>}
 */
async function getSource(tab) {
	if (!tab?.url) {
		return;
	}

	const allsidesData = await getAllSidesData();
	return findBestSource(allsidesData.allsides_media_bias_ratings, new URL(tab.url));
}

/**
 * @param {chrome.tabs.Tab} tab 
 */
async function switchIcon(tab){
	const source = await getSource(tab);
	const tabId = tab.id;

	if (!tabId) {
		return;
	}

	if (source) {
		chrome.action.setIcon({
			path: {
				24: images[source.publication.media_bias_rating].img,
			},
			tabId,
		});
		chrome.action.setTitle({
			title: `${source.publication.media_bias_rating} - ${source.publication.source_name}`,
			tabId,
		});
		chrome.action.setPopup({
			popup: "Popup/info_popup.html",
			tabId,
		});
	}
}

async function getCurrentTab() {
	return (await chrome.tabs.query({
		active: true,
		currentWindow: true,
	}))[0];
}

chrome.tabs.onActivated.addListener(info => {
	chrome.tabs.get(info.tabId, tab => {
		switchIcon(tab);
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	switchIcon(tab);
});

chrome.runtime.onMessage.addListener((
	/** @type {import("./types").Message} */ message,
	sender,
	/** @type {(response: import("./types").Response) => void} */ sendResponse,
) => {
	(/** @type {() => Promise<import("./types").Response>} */ async () => {
		const tab = await getCurrentTab();
	
		switch (message.type) {
			case 'requestSource':
				return {
					type: 'requestSource',
					source: await getSource(tab),
				};
			case 'requestContext':
				return await fetchContext(await getSource(tab));
		}
	})().then(response => sendResponse(response));

	// Keeps sendResponse
	return true;
});
