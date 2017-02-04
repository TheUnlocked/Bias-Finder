$(function () {
    $('#goto_key').keypress(function (e) {
        if (e.keyCode == 13)
            $('#goto_button').click();
    });
    $('#new_key').keypress(function (e) {
        if (e.keyCode == 13)
            $('#new_shortcut_button').click();
    });
    $('#new_url').keypress(function (e) {
        if (e.keyCode == 13)
            $('#new_shortcut_button').click();
    });
});


document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#goto_button').addEventListener('click', gotoClicked);
});
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#new_shortcut_button').addEventListener('click', addShortcutClicked);
});
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#view_all_button').addEventListener('click', viewAllShortcutsClicked);
});