import { CustomRequest, Course, StoreProduct, StoreProducts } from '../lib/model'

const icons = {
    enabled: "images/icon.png",
    disabled: "images/disabled-icon.png"
}

const filterObject = {
    urls: [
        "https://tracking.rosettastone.com/*",
        "https://gaia-server.rosettastone.com/graphql"
    ]
}

const FLUENCY_BUILDER = "fluency_builder"
const FOUNDATIONS = "foundations"

// forces the request to be dropped if older than 5h
const MAX_REQUEST_AGE = 5 * 60 * 60 * 1000;

// Foundations code base.
const filterFoundations = {
    urls: [
        "https://tracking.rosettastone.com/*"
    ]
}


function onBeforeRequestFoundations(endpoint, bodyString: string | null, details) {
    if (details.method === "POST" && endpoint === "path_scores" && bodyString?.includes("delta_time")) {
        chrome.storage.session.get([FOUNDATIONS]).then(({foundations}: StoreProducts) => {
            if (foundations?.timeRequest === undefined) {
                chrome.storage.session.set({
                    foundations: {
                        ...foundations,
                        timeRequest: {
                            id: details.requestId,
                            headers: details.requestHeaders,
                            body: bodyString,
                            url: details.url,
                        },
                        ready: false,
                    },
                })
            }
        })
    } else if (details.method === "GET" && endpoint === "path_step_scores") {
        chrome.storage.session.get([FOUNDATIONS]).then(({foundations}: StoreProducts) => {
            chrome.storage.session.set({
                foundations: {
                    ...foundations,
                    courseRequest: {
                        id: details.requestId,
                        headers: details.requestHeaders,
                        url: details.url,
                    },
                },
            })
        })
    }
}

function onBeforeSendHeadersFoundations(details) {

    chrome.storage.session.get([FOUNDATIONS]).then(({ foundations }: StoreProducts) => {
        const headers = {};
        for (let {name, value} of details.requestHeaders)
            headers[name] = value
        if (foundations?.timeRequest?.id === details.requestId) {
            if (foundations?.timeRequest)
                foundations.timeRequest.headers = headers

            if (foundations)
                foundations.ready = true
        } else if (foundations?.courseRequest?.id === details.requestId) {
            if (foundations?.courseRequest)
                foundations.courseRequest.headers = headers
        } else 
            return;

        chrome.storage.session.set({
            foundations
        })
    })
}

chrome.webRequest.onBeforeRequest.addListener((details) => {
    const endpoint = details.url
        .split('?')[0]
        .split("/")
        .pop()

    const rawBodies = details.requestBody?.raw
    let body: string | null = null;
    if (rawBodies !== undefined)
        body = new TextDecoder().decode(rawBodies[0]?.bytes)

    onBeforeRequestFoundations(endpoint, body, details)
}, filterFoundations, ["requestBody", "extraHeaders"])

chrome.webRequest
    .onBeforeSendHeaders
    .addListener(
        onBeforeSendHeadersFoundations,
        filterFoundations,
        ["requestHeaders", "extraHeaders"]
    )


// Fluency builder code base.
const filterFluencyBuilder = {
    urls: [
        "https://gaia-server.rosettastone.com/*"
    ]
}

function onBeforeRequestFluencyBuilder(endpoint, bodyString, details) {
    if (endpoint !== "graphql")
        return
    
    const body = JSON.parse(bodyString)
    if (body.operationName !== "AddProgress")
        return 

    chrome.storage.session.get([FLUENCY_BUILDER]).then(({fluency_builder}) => {
        if (fluency_builder?.ready && fluency_builder?.timestamp - Date.now() < MAX_REQUEST_AGE)
            return

        chrome.storage.session.set({
            fluency_builder: {
                request: {
                    headers: details.requestHeaders,
                    body: bodyString,
                    url: details.url,
                },
                ready: false,
                requestId: details.requestId,
                timestamp: Date.now(),
            }
        })
    })
}

function onBeforeSendHeadersFluencyBuilder(details) {


    chrome.storage.session.get([FLUENCY_BUILDER]).then(({ fluency_builder }) => {
        if (fluency_builder?.requestId != details.requestId) {
            return
        }

        const headers = {};
        for (let {name, value} of details.requestHeaders)
            headers[name] = value
        fluency_builder.request.headers = headers
        fluency_builder.timestamp = Date.now()
        fluency_builder.ready = true

        chrome.storage.session.set({
            fluency_builder
        })
    })
}

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (details.method !== "POST")
        return

    const endpoint = details.url
        .split('?')[0]
        .split("/")
        .pop()

    const rawBodies = details.requestBody?.raw
    if (rawBodies === undefined)
        return;
    const body = new TextDecoder().decode(rawBodies[0]?.bytes)
    onBeforeRequestFluencyBuilder(endpoint, body, details)
}, filterFluencyBuilder, ["requestBody", "extraHeaders"])

chrome.webRequest
    .onBeforeSendHeaders
    .addListener(
        onBeforeSendHeadersFluencyBuilder,
        filterFluencyBuilder,
        ["requestHeaders", "extraHeaders"]
    )

const urlValid = (url) => url?.includes("rosettastone.com")

function getProduct(url) {
    if(url.match(/learn\.rosettastone\.com/) !== null) {
        return FLUENCY_BUILDER
    } else if (url.match(/totale\.rosettastone\.com/) !== null ){
        return FOUNDATIONS
    }

    return null
}

function onTabUpdate(tab) {
    const valid = urlValid(tab?.url)
    
    const product = getProduct(tab.url)
    if(valid && product != null) {
        chrome.action.enable(tab.id)
        chrome.storage.session.get([product]).then(values => {
            const readyState = values[product]?.ready
            if (readyState) {
                chrome.action.setBadgeText({text: "stonks"})
                chrome.action.setBadgeBackgroundColor({color: "green"}, () => null)
            } else {
                chrome.action.setBadgeText({text: "not stonks"})
                chrome.action.setBadgeBackgroundColor({color: "red"}, () => null)
            }
        })
    }
    else {
        chrome.action.disable(tab.id)
        chrome.action.setBadgeText({text: ""})
    }
}

chrome.storage.onChanged.addListener(async (changes, namespace) => {
	const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    const product = getProduct(tab.url)
    if (product === null)
        return
    
    if (Object.keys(changes).includes(product))
        onTabUpdate(tab)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        onTabUpdate(tab);
    }
})

chrome.tabs.onActivated.addListener(({tabId}) => {
    chrome.tabs.get(tabId, onTabUpdate)
});
