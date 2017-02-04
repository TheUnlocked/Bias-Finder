function truncate(string, len) {
    if (string.length > len)
        return string.substring(0, len - 3) + '...';
    else
        return string;
};

function loadPage() {
    getAllShortcuts(function (dict) {
        var keys = Object.keys(dict);
        var result = "";
        if (keys.length > 0) {
            for (i = 0; i < keys.length; i++) {
                var name = truncate(keys[i], 18);
                var url = truncate(dict[keys[i]], 24);
                var template = `<input type="button" class="delete" id="${keys[i]}" value="Delete" style="margin-top:2px;"> ${name}: ${url}<br />`;
                result += template;
            }
        }
        else {
            result = `<span style="font-style:italic">You don't have any web shortcuts... :(</span>`
        }
        document.getElementById("array").innerHTML = result
    });
}

loadPage();

function returnClicked() {
    window.location.href = "../popup.html";
}