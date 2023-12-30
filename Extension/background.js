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

/** @type {import("./types").AllSidesDataFeed} */
let _allsidesDataCache;

/**
 * @returns {Promise<import("./types").AllSidesDataFeed>}
 */
async function getAllSidesData() {
	try {
		_allsidesDataCache ??= await (await fetch('https://www.allsides.com/media-bias/json/noncommercial/publications')).json();
		return _allsidesDataCache;
	}
	catch (e) {
		console.error('Failed to fetch AllSides data!');
		console.error(e);
		return { allsides_media_bias_ratings: [] };
	}
}


/** @type {Map<import("./types").NewsSource, import("./types").RequestContextResponse | null>} */
const _contextMap = new Map();

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

	const existingResult = _contextMap.get(source);
	if (existingResult) {
		return existingResult;
	}

	const html = await (async () => {
		try {
			const html = await (await fetch(source.publication.allsides_url)).text();
			return html;
			// chrome.offscreen.createDocument({
			// 	url: 
			// 	reasons: [chrome.offscreen.Reason.DOM_PARSER],
			// 	justification: 'To read data from AllSides'
			// })
			// const doc = new DOMParser().parseFromString(html, 'text/html');
			// return doc;
		}
		catch (e) {
			console.error('Failed to fetch AllSides page for ', source);
			console.error(e);
		}
	})();

	if (html) {
		// Fetching the paragraph is disabled for now
		// result.firstParagraph = html.split('<div id="content"', 2)[1].split('<p>', 2)[1].split('</p>', 1)[0];
	
		// const confidenceContainer = html.querySelector('#source-page-top :has(.confidence-low, .confidence-medium, .confidence-high');
		// if (confidenceContainer) {
		// 	result.confidence = [
		// 		'Low',
		// 		'Medium',
		// 		'High'
		// 	][['confidence-low', 'confidence-medium', 'confidence-high'].findIndex(c => confidenceContainer.classList.contains(c))];
		// }

		const match = /** @type {RegExpMatchArray} */ (html.match(/<section id="source-page-top">[\s\S]*class="confidence-(low|medium|high)">/m));
		if (match) {
			result.confidence = {
				'low': 'Low or Initial',
				'medium': 'Medium',
				'high': 'High'
			}[match[1]];
		}
	}

	_contextMap.set(source, result);
	return result;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param {string} string
 */
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {import("./types").NewsSource[]} sources 
 * @param {URL} url
 * @returns {import("./types").NewsSource | null} 
 */
function findBestSource(sources, url) {
	const biasList = sources.filter(source => {
		if (!source.publication.source_url || source.publication.source_url === ""){
			return false;
		}

		const sourceUrl = new URL(source.publication.source_url);

		const basicHostname = sourceUrl.hostname.replace(/^www\./, '');
		const pathExp = new RegExp(`^${escapeRegExp(sourceUrl.pathname)}`, 'i');
		
		// Should match host and path (just matching host can have over-zealous results)
		if (url.hostname.endsWith(basicHostname) && pathExp.test(url.pathname)) {
			return true;
		}
	});

	if (biasList.length === 0) {
		return null;
	}

	/**
	 * @param {string} haystack 
	 * @param {string} needle 
	 * @returns {number}
	 */
	function indexOfOrInfinity(haystack, needle) {
		const idx = haystack.indexOf(needle);
		if (idx === -1) {
			return Infinity;
		}
		return idx;
	}

	return biasList.reduce((best, next) => {
		const bestUrl = new URL(best.publication.source_url);
		const nextUrl = new URL(next.publication.source_url);
		
		// for hostname, less is a more complete match is better
		const hostnameIndexDiff = indexOfOrInfinity(url.hostname, bestUrl.hostname) - indexOfOrInfinity(url.hostname, nextUrl.hostname);
		if (hostnameIndexDiff > 0) {
			return next;
		}
		else if (hostnameIndexDiff < 0) {
			return best;
		}
		else {
			const pathIncludesBest = url.pathname.includes(bestUrl.pathname);
			const pathIncludesNext = url.pathname.includes(nextUrl.pathname);
			if (pathIncludesBest && !pathIncludesNext) {
				return best;
			}
			else if (pathIncludesNext && !pathIncludesBest) {
				return next;
			}
			else {
				return bestUrl.pathname.length > nextUrl.pathname.length ? best : next;
			}
		}
	});
}

/** @type {Record<string, import("./types").NewsSource | null>} */
const _sourceMap = {};

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
	_sourceMap[tab.url] ??= findBestSource(allsidesData.allsides_media_bias_ratings, new URL(tab.url));
	return _sourceMap[tab.url] ?? undefined;
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
