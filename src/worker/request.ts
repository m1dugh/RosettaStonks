import { BeforeSendHeadersParams, FoundationsTimeRequestKey, FoundationsCourseRequestKey, FoundationsRequestFilter, BeforeSendRequestParams, FluencyBuilderRequestFilter, FluencyBuilderTimeRequestKey } from "./env.ts"

type Headers = Array<{name: string, value: string}> | undefined;

function mergeHeaders(...headers: Headers[]): Headers {
    let result: Headers = []
    for (const h of headers) {
        if (h !== undefined)
            result = [...result, ...h]
    }

    return result
}

export interface Request {
    requestId: string;
    method: "GET" | "POST";
    url: string;
    requestHeaders: Headers;
    body: string | null;
    timestamp: Date;
}

interface BeforeSendHeaderRequest {
    requestId: string;
    requestHeaders: Headers;
}

function storeRequest(key: string): (req: Request) => void {
    return (req: Request) => {
        const slice: any = {}
        slice[key] = req;
        console.debug(`Storing request at "${key}"`, req)
        browser.storage.session.set(slice)
    }
}

function requestFromObject(value: any): Request {
    let body: string | null = null;
    if (value.requestBody != null) {
        body = new TextDecoder().decode(value.requestBody.raw[0].bytes)
    }
    let timestamp: Date;
    if (value.timeStamp != null)
        timestamp = new Date(value.timeStamp)
    else
        timestamp = new Date()
    return {
        ...value,
        body,
        timestamp,
    }
}

export interface RequestFilter {
    filter: (details: Request) => boolean;
    onMatched: (request: Request) => void;
}

const foundationsTimeRequest: RequestFilter = {
    filter: (details: Request) => {
        if (details.method !== "POST")
            return false
        const url = URL.parse(details.url)
        return url?.pathname?.endsWith("path_scores") || false
    },
    onMatched: storeRequest(FoundationsTimeRequestKey),
}

const foundationsCourseRequest: RequestFilter = {
    filter: (details: Request) => {
        if (details.method !== "GET")
            return false
        const url = URL.parse(details.url)
        return url?.pathname?.endsWith("path_step_scores") || false
    },
    onMatched: storeRequest(FoundationsCourseRequestKey),
}

const fluencyBuilderTimeRequest: RequestFilter = {
    filter: (details: Request) => {
        if (details.method !== "POST" || details.body === null)
            return false
        const url = URL.parse(details.url)
        if (url?.pathname !== "/graphql")
            return false

        const body = JSON.parse(details.body)
        return body.operationName === "AddProgress"
    },
    onMatched: storeRequest(FluencyBuilderTimeRequestKey),
}

function setupRequestListeners(urlFilters: {urls: string[]}, filters: Array<RequestFilter>): void {
    const requestBuffers: Array<Request | null> = new Array(filters.length)

    browser.webRequest.onBeforeRequest.addListener((details: any) => {
        for (let i = 0; i < filters.length; i++) {
            const req = requestFromObject(details)
            if (filters[i].filter(req))
                requestBuffers[i] = req
        }
    }, urlFilters
    , BeforeSendRequestParams)

    browser.webRequest.onBeforeSendHeaders.addListener((details: BeforeSendHeaderRequest) => {
        for (let i = 0; i < requestBuffers.length; i++) {
            const req = requestBuffers[i]
            if (req?.requestId !== details.requestId)
                continue

            req.requestHeaders = mergeHeaders(req.requestHeaders, details.requestHeaders)
            filters[i].onMatched(req)
            requestBuffers[i] = null
        }
    }, urlFilters
    , BeforeSendHeadersParams)
}

export function setupListeners(): void {
    setupRequestListeners(FoundationsRequestFilter, [
        foundationsTimeRequest,
        foundationsCourseRequest,
    ])

    setupRequestListeners(FluencyBuilderRequestFilter, [
        fluencyBuilderTimeRequest
    ])
}
