
const regexGenerator = /(https?:\/\/)?((?:[^/\n\r .]+?\.)*[^/\n\r .]+?\.)?([^/\n\r .]+?\.[^/\n\r .]+)(\/.*)?/;

export default class NewsSource {
    /**
     * 
     * @param {string} sourceName The name of the news source
     * @param {string} allsidesUrl The URL of the AllSides page for the news source
     * @param {string} siteUrl The site's URL regex matcher
     * @param {Number} biasRating The bias rating of the news source
     */
    constructor(sourceName, allsidesUrl, siteUrl, biasRating, {
        protocol,
        domain,
        subdomain,
        path,
        rejectMatches=false
    } = {}){
        this.sourceName = sourceName;
        this.allsidesUrl = allsidesUrl.replace(/\\\//, '/');
        this.siteUrl = siteUrl.replace(/\\\//, '/');
        this.biasRating = NewsSource.BIASES[biasRating];
        this.firstParagraph = "";
        this.confidence = "";
        this.rejectMatches = rejectMatches;

        let urlStrings = siteUrl.match(regexGenerator);
        if (!urlStrings || urlStrings[0] != siteUrl){
            rejectMatches = true;
        }
        else{
            [this.protocol, this.subdomain, this.domain, this.path] = [protocol, subdomain, domain, path];
            if (this.protocol === false)
                this.protocol = "";
            if (this.subdomain === false)
                this.subdomain = "";
            if (this.path === false)
                this.path = "";

            if (this.protocol === true || !protocol){
                if (!protocol) this.protocol = "(?:https?:\/\/)?";
                else this.protocol = urlStrings[1];
            }
            if (typeof(this.domain) !== typeof(""))
                this.domain = urlStrings[3];
            if (this.subdomain === true || (this.subdomain != "" && !this.subdomain)){
                subdomain = urlStrings[2];
                if (subdomain == 'www')
                    subdomain = "(?:www)?";

                if (!subdomain) subdomain = "";
                this.subdomain = subdomain;
            }
            if (this.path === true || (this.path != "" && !this.path)){
                path = urlStrings[4];

                if (path){
                    let butlast = path.split('/');
                    let last = butlast.pop();
                    butlast = butlast.join('/');

                    if (last.includes('.')){
                        path = butlast + '/';
                    }
                    path = path.split('?', 1)[0];
                    path = path.split('#', 1)[0];
                }

                if (!path || path == '/') path = "(?:\/.*)?";

                this.path = path;
            }
        }
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
    test(url){
        return !this.rejectMatches && this.regexUrl.test(url);
    }

    get regexUrl(){
        return new RegExp(this.protocol + this.subdomain + this.domain + this.path + ".*");
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

NewsSource.BIASNAMES = Object.freeze({
    [-1]: "null",
    0: "Left",
    1: "Lean Left",
    2: "Center",
    3: "Lean Right",
    4: "Right",
    5: "Mixed",
    6: "Not Rated"
});
