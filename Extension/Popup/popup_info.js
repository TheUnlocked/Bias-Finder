// @ts-check

/** @type {Record<import("../types").BiasRating, { image: string, alt: string, description: string }>} */
const ratingObjs = {
    "Left": {
        image: "Icons/bias-left.png",
        alt: "Left bias",
        description: "This site tends to be biased to the left. This trend reflects the site as a whole and not any specific article.",
    },
    "Lean Left": {
        image: "Icons/bias-leaning-left.png",
        alt: "Leaning left bias",
        description: "This site tends to be slightly biased to the left. This trend reflects the site as a whole and not any specific article.",
    },
    "Center": {
        image: "Icons/bias-center.png",
        alt: "Center bias",
        description: "This site tends to be centrally aligned. This trend reflects the site as a whole and not any specific article.",
    },
    "Lean Right": {
        image: "Icons/bias-leaning-right.png",
        alt: "Leaning right bias",
        description: "This site tends to be slightly biased to the right. This trend reflects the site as a whole and not any specific article.",
    },
    "Right": {
        image: "Icons/bias-right.png",
        alt: "Right bias",
        description: "This site tends to be biased to the right. This trend reflects the site as a whole and not any specific article.",
    },
    "Mixed": {
        image: "Icons/bias-mixed.png",
        alt: "Mixed bias",
        description: "This site has a very mixed alignment, or simply doesn't fall on the left/right partisanship scale.",
    },
    "Not Rated": {
        image: "Icons/bias-not-yet-rated.png",
        alt: "Site not rated",
        description: "This site has not yet been rated.",
    },
};

/**
 * 
 * @param {import("../types").NewsSource} source 
 */
function generate(source) {
    const rating = source.publication.media_bias_rating;

    /** @type {HTMLElement} */
    // @ts-ignore
    const iconContainer = document.getElementById("icon");

    if (!iconContainer.hasChildNodes()) {
        const img = document.createElement('img');
        img.src = ratingObjs[rating].image;
        img.alt = ratingObjs[rating].alt;
        iconContainer.appendChild(img);
    }

    /** @type {HTMLElement} */
    // @ts-ignore
    const ratingDescriptionContainer = document.getElementById('desc');
    ratingDescriptionContainer.innerText = ratingObjs[rating].description;
    
    if (rating !== 'Not Rated') {
        chrome.runtime.sendMessage(
            /** @type {import("../types").Message} */({ type: 'requestContext' }),
            (/** @type {import("../types").RequestContextResponse} */ { firstParagraph, confidence }) => {

                if (confidence) {
                    /** @type {HTMLElement} */
                    // @ts-ignore
                    const confidenceElt = document.getElementById("confidence");
                    confidenceElt.innerText = confidence;
                }

                /** @type {HTMLElement} */
                // @ts-ignore
                const sourceDescriptionContainer = document.getElementById("site_desc");
                
                const moreInfoLink = document.createElement('a');
                moreInfoLink.id = 'link';
                moreInfoLink.innerText = 'Click here for more information';
                moreInfoLink.href = '#';
                moreInfoLink.addEventListener('click', () => {
                    chrome.tabs.create({ url: source.publication.allsides_url });
                });

                if (firstParagraph) {
                    sourceDescriptionContainer.innerText = firstParagraph;
                    sourceDescriptionContainer.appendChild(document.createElement('br'));
                }
                else {
                    sourceDescriptionContainer.innerText = '';
                    sourceDescriptionContainer.appendChild(moreInfoLink);
                }
            }
        );
    }

    /** @type {HTMLElement} */
    // @ts-ignore
    const titleElt = document.getElementById("title");
    titleElt.innerText = source.publication.source_name;
}

window.addEventListener('load', async () => {
    /** @type {import("../types").RequestSourceResponse} */
    const result = await chrome.runtime.sendMessage(/** @type {import("../types").Message} */({ type: 'requestSource' }));
    const { source } = result;
    if (source) {
        generate(source);
    }
});
