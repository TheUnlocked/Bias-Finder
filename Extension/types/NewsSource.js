
export default class NewsSource {
    /**
     * 
     * @param {string} sourceName The name of the news source
     * @param {string} allsidesUrl The URL of the AllSides page for the news source
     * @param {RegExp} siteExp The site's URL regex matcher
     * @param {Number} biasRating The bias rating of the news source
     */
    constructor(sourceName, allsidesUrl, siteExp, biasRating){
        this.sourceName = sourceName;
        this.allsidesUrl = allsidesUrl;
        this.siteExp = siteExp;
        this.biasRating = NewsSource.BIASES[biasRating];
        this.firstParagraph = "";
        this.confidence = "";
    }

    /**
     * @returns {Promise<NewsSource>}
     */
    retrieveExtendedData(){
        return new Promise((resolve, reject) => {
            $.get(this.allsidesUrl)
                .done((data) => {
                    let dataText = String(data);

                    this.firstParagraph = dataText.split('<div id="content"', 2)[1].split('<p>', 2)[1].split('</p>', 1)[0];
                    this.confidence = dataText.split('<h4>Confidence Level:</h4>', 2)[1].split('<strong class="margin-left-25">')[1].split('</', 1)[0];

                    let biasString = dataText.split('<span class="bias-value">', 2)[1].split('</', 1)[0].toUpperCase();
                    this.biasRating = NewsSource.BIASES[biasString];

                    this.sourceName = dataText.split('<div class="span4 source-image-wrapper News Media">', 2)[1].split('<h2>', 2)[1].split('</', 1)[0];

                    resolve(this);
                })
                .fail(reject);
        });
    }

    get biasImage(){
        return NewsSource.IMAGES[this.biasRating];
    }

    /**
     * 
     * @param {string} url The current URL to match
     */
    match(url){
        return this.siteExp.test(url);
    }

    /**
     * 
     * @param {string} url The URL provided by the AllSides database
     */
    static parseRawURL(url){
        return new RegExp(``).compile();
    }
}

NewsSource.BIASES = Object.freeze({
    NONE: -1,
    LEFT: 0,
    LLEFT: 1,
    CENTER: 2,
    LRIGHT: 3,
    RIGHT: 4,
    MIXED: 5,
    NOT_RATED: 6,

    "LEAN LEFT": 1,
    "LEAN RIGHT": 3,
    "NOT RATED": 6,

    [null]: -1,
    [undefined]: -1,
    71: 0,
    72: 1,
    73: 2,
    74: 3,
    75: 4,
    2707: 5,
    2690: 6,

    [-1]: -1,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6
});

NewsSource.IMAGES = Object.freeze({
    [NewsSource.BIASES.NONE]: "Icons/icon.png",
    [NewsSource.BIASES.LEFT]: "Icons/icon-left.png",
    [NewsSource.BIASES.LLEFT]: "Icons/icon-leaning-left.png",
    [NewsSource.BIASES.CENTER]: "Icons/icon-center.png",
    [NewsSource.BIASES.LRIGHT]: "Icons/icon-leaning-right.png",
    [NewsSource.BIASES.RIGHT]: "Icons/icon-right.png",
    [NewsSource.BIASES.MIXED]: "Icons/icon-mixed.png",
    [NewsSource.BIASES.NOT_RATED]: "Icons/icon-not-yet-rated.png"
});