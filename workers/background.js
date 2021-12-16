const icons = {
    enabled: "images/icon.png",
    disabled: "images/disabled-icon.png"
}

// forces the request to be dropped if older than 5h
const maxRequestAge = 5 * 60 * 60 * 1000;

chrome.tabs.onActivated.addListener(async ({tabId}) => {
    chrome.tabs.get(tabId, (tab) => {
        if (!tab)
            return;
        const urlValid = tab.url.includes("rosettastone.com");
        /*chrome.action.setIcon({
            path: {
                128: urlValid ? icons.enabled : icons.disabled
            }
        }, () => null)*/
        chrome.action.setPopup({popup: urlValid ? "/index.html" : ""}, () => null)
    })

    chrome.storage.sync.get(["ready", "timestamp"], ({ready, timestamp}) => {
        if (ready && Date.now() - timestamp > maxRequestAge)
            chrome.storage.sync.set({ready: false})
    });

});


const filterObject = {
    urls: ["https://tracking.rosettastone.com/*"]
}


chrome.webRequest.onBeforeRequest.addListener((details) => {

        chrome.storage.sync.get(["ready", "request"], ({ready, request}) => {
            if (ready)
                return;

            if (!(details.type === "xmlhttprequest") || !(details.method === "POST"))
                return;

            const bodyString = new TextDecoder().decode(details.requestBody?.raw[0]?.bytes)
            if (!bodyString.includes("delta_time"))
                return;

            chrome.storage.sync.set({
                request:
                    {
                        url: details.url,
                        headers: details.requestHeaders,
                        body: bodyString,
                    },
                ready: false,
                id: details.requestId
            })
        })

    },
    filterObject,
    ["requestBody", "extraHeaders"])

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    chrome.storage.sync.get(["request", "id", "ready"], ({request, ready, id}) => {
        if (!ready && details.requestId === id) {

            const headers = {};
            for (let {name, value} of details.requestHeaders)
                headers[name] = value
            request.headers = headers

            chrome.storage.sync.set({request, ready: true, timestamp: Date.now()})

        }


    });

}, filterObject, ["requestHeaders", "extraHeaders"])