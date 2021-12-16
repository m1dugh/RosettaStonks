const icons = {
    enabled: "images/icon.png",
    disabled: "images/disabled-icon.png"
}

const filterObject = {
    urls: ["https://tracking.rosettastone.com/*"]
}

// forces the request to be dropped if older than 5h
const maxRequestAge = 5 * 60 * 60 * 1000;


// chrome.runtime.onInstalled.addListener(() => {

const onTabUpdate = (tab) => {
    const urlValid = tab?.url.includes("rosettastone.com")

    chrome.action.setBadgeBackgroundColor({
        color: urlValid ? "green" : "red"
    }, () => null)
    chrome.action.setBadgeText({
        text: urlValid ? "stonks" : "not stonks"
    })

    chrome.action.setPopup({popup: urlValid ? "/index.html" : ""}, () => null)

    chrome.storage.sync.get(["ready", "timestamp"], ({ready, timestamp}) => {
        if (ready && Date.now() - timestamp > maxRequestAge)
            chrome.storage.sync.set({ready: false})

    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        onTabUpdate(tab);
    }
})

chrome.tabs.onActivated.addListener(({tabId}) => {
    chrome.tabs.get(tabId, onTabUpdate)
});


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

//});