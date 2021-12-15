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
            request.timestamp = Date.now()

            chrome.storage.sync.set({request, ready: true})

        }


    });

}, filterObject, ["requestHeaders", "extraHeaders"])