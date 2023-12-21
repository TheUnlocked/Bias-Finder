// @ts-check

window.addEventListener('load', () => {
    /** @type {HTMLButtonElement} */
    // @ts-ignore
    const searchBtn = document.getElementById('confirm_search');
    /** @type {HTMLInputElement} */
    // @ts-ignore
    const searchBox = document.getElementById('allsides_search');

    function executeSearch() {
        chrome.tabs.create({
            url: `https://www.allsides.com/media-bias/ratings?title=${encodeURIComponent(searchBox.value)}`,
        });
    }

    searchBtn.addEventListener('click', () => {
        executeSearch();
    });

    searchBox.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    });
});
