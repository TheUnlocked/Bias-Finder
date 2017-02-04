document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#return').addEventListener('click', returnClicked);
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete")) {
            deleteShortcut(event.target.id);
            window.location.href = "index.html"
        }
    });
});