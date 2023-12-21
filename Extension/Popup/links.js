// @ts-check

window.addEventListener('load', () => {
    for (const elt of document.querySelectorAll('a[href]')) {
        elt.addEventListener('click', e => {
            chrome.tabs.create({ url: elt.getAttribute('href') ?? undefined });
            e.preventDefault();
        });
    }
});
