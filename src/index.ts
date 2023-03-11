const form = document.querySelector<HTMLFormElement>("#add_time_form")
const time_to_add = form?.querySelector<HTMLInputElement>("#time_to_add")
const submit_button = form?.querySelector<HTMLButtonElement>("button[type=submit]")

const FLUENCY_BUILDER = "fluency_builder"
const FOUNDATIONS = "foundations"
const NONE = null
const MAX_TIME = 480000;

interface CustomRequest {
    body: string
    headers: any
    url: string
}

function print_data(data: any) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then(([tab]) => {
        if(tab.id === undefined)
            return
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: (data) => console.log(data),
            args: [data]
        }, () => null)
    });
}

async function getTab() {
    return await chrome.tabs.query({
        active: true,
        currentWindow: true,
    }).then((tabs) => tabs[0])
}

function getProduct(url: string | undefined) {
    if(url?.match(/learn\.rosettastone\.com/) !== null) {
        return FLUENCY_BUILDER
    } else if (url?.match(/totale\.rosettastone\.com/) !== null) {
        return FOUNDATIONS
    }
    return null
}

function createRandomUUID() {
    const seqlen = 8
    const seqcount = 3
    let res: string = "";

    for (let i = 0; i < seqcount; i++) {
        let charCodes: number[] = []
        for(let j = 0; j < seqlen; j++) {
            const val = Math.round(Math.random() * 16)
            if (val < 10) {
                charCodes.push(48 + val)
            } else {
                charCodes.push(97 - 10 + val)
            }
        }
        if (i === 0) {
            res = String.fromCharCode(...charCodes)
        } else {
            res += "-" + String.fromCharCode(...charCodes)
        }
    }

    return res
}

function changeBodyFluencyBuilder(bodyString: string, minutes: number): string {
    const body: any = JSON.parse(bodyString)
    const durationMs = minutes * 60 * 1000

    const messages: any[] = body.variables.messages
    for (let message of messages) {
        message.durationMs = durationMs
        message.activityAttemptId = createRandomUUID()
        message.activityStepAttemptId = createRandomUUID()
    }

    return JSON.stringify(body)
}

function changeBodyFoundations(bodyString: string, timeMs: number): string {
    const body = new DOMParser().parseFromString(bodyString, "text/xml");
    const rootTag = body.documentElement.tagName

    body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = timeMs.toString();
    body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString()

    return `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`
}

function sendRequest(request: CustomRequest, tabId: number) {
    return chrome.scripting.executeScript({
        target: {
            tabId
        },
        func: ((request) => {
            window.fetch(request.url, {
                method: "POST",
                headers: request.headers,
                body: request.body
            }).then((res) => console.log(res?.json()))
            .catch((err) => console.error(err))
        }),
        args: [request],
    })
}

async function main() {

    if(form == null || time_to_add == null)
        return

    const tab = await getTab()
    const product = getProduct(tab.url)

    form.addEventListener("submit", (e: SubmitEvent) => {
        e.preventDefault()

        const time = Number(time_to_add.value)
        chrome.storage.session.get([product]).then((store) => {
            const values = store[product]
            if(!values?.ready)
                return
            if(tab.id == undefined)
                return
            if (submit_button == undefined)
                return

            if (product === FLUENCY_BUILDER) {
                values.request.body = changeBodyFluencyBuilder(values.request.body, time)
                const req = values.request as CustomRequest

                submit_button.disabled = true
                submit_button.innerText = "..."
                sendRequest(req, tab.id).then(() => {
                    submit_button.innerText = "add time"
                    submit_button.disabled = false
                })

            } else if (product === FOUNDATIONS) {
                let remainingTime = time * 60 * 1000
                const promises = []
                submit_button.disabled = true
                submit_button.innerText = "..."
                while (remainingTime > 0) {
                    const requestTime = remainingTime > MAX_TIME ? MAX_TIME : remainingTime;
                    values.request.body = changeBodyFoundations(values.request.body, requestTime)
                    const req = values.request as CustomRequest
                    print_data(req)
                    promises.push(sendRequest(req, tab.id))
                    remainingTime -= MAX_TIME
                }
                Promise.all(promises).then(() => {
                    submit_button.innerText = "add time"
                    submit_button.disabled = false
                })
            }

            time_to_add.value = "0"
        })

    })
}

main()

