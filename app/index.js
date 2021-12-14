
const statusBar = document.getElementById("status")

chrome.storage.sync.get(["request"], ({request}) => {
    statusBar.innerText = request.ready ? "ready" : "not ready";

})