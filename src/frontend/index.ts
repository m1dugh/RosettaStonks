import { getProduct, CustomRequest } from '../lib/model';
import { getTimeRequests } from '../lib/front-utils';

const form = document.querySelector<HTMLFormElement>("#add_time_form")
const time_to_add = form?.querySelector<HTMLInputElement>("#time_to_add")
const submit_button = form?.querySelector<HTMLButtonElement>("button[type=submit]")

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
    if (tab.url === undefined)
        return;

    const product = getProduct(tab.url)

    form.addEventListener("submit", (e: SubmitEvent) => {
        e.preventDefault()

        const time = new Date(Number(time_to_add.value) * 60 * 1000)
        console.log(product)

        if (product === null)
            return;
        chrome.storage.session.get([product.name]).then((store) => {
            const values = store[product.name]
            if(!values?.ready)
                return

            if (submit_button == undefined)
                return

            const requests = getTimeRequests(product, time, values.request)
            if (requests === null)
                return;

            if(tab?.id == undefined)
                return

            submit_button.disabled = true
            submit_button.innerText = "..."

            const promises = requests.map(req => {
                if (tab.id !== undefined)
                    sendRequest(req, tab.id)
            })

            Promise.all(promises).then(() => {
                submit_button.innerText = "add time"
                submit_button.disabled = false
            })

            time_to_add.value = "0"
        })

    })
}

main()

