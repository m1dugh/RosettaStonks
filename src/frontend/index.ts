import { getProduct, CustomRequest, StoreProducts, ProductConfig } from '../lib/model';
import { getTimeRequests } from '../lib/front-utils';

const form = document.querySelector<HTMLFormElement>("#add_time_form")
const time_to_add = form?.querySelector<HTMLInputElement>("#time_to_add")
const submit_button = form?.querySelector<HTMLButtonElement>("button[type=submit]")
const validateLessonButton = document.querySelector<HTMLButtonElement>("button#validateLessonButton");

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

const executeTab = (tabId: number, cb: any, args: any[]) => chrome.scripting.executeScript({
    target: { tabId },
    func: cb,
    args: [args],
})

async function validateLesson(e: any) {

    e.preventDefault();
    const tab = await getTab()
    if (tab.url === undefined || validateLessonButton === null)
        return;
    const product = getProduct(tab.url)

    validateLessonButton.innerText = "...";
    validateLessonButton.disabled = true;
    await foundationsValidateLesson(product)
    validateLessonButton.innerText = "validate lesson"
    validateLessonButton.disabled = false;
}

function foundationsValidateLesson(product: ProductConfig | null) {
    if (product === null)
        return;

    return chrome.storage.session.get([product.name]).then(async ({foundations}: StoreProducts) => {
        const courseRequest = foundations?.courseRequest
        if (courseRequest === undefined)
            return;

        const serializer = new XMLSerializer()
        const res = await window.fetch(courseRequest.url, { method: "GET", headers: courseRequest.headers })
        const text = await res.text()
        const body = new DOMParser().parseFromString(text, "text/xml");

        const promises: Promise<any>[] = []

        for (let element of body.querySelectorAll("path_step_score")) {
            const challenge_number = element.querySelector("number_of_challenges")?.innerHTML
            const correct = element.querySelector("score_correct")
            if (correct && challenge_number) {
                if (correct.innerHTML === challenge_number)
                    continue;
                else
                    correct.innerHTML = challenge_number
            }

            const path_step = element.querySelector("path_step_media_id")?.innerHTML
            if (!path_step)
                continue

            const url = courseRequest.url + "&" + new URLSearchParams({
                _method: "put",
                path_step_media_id: path_step,
            })
            const bodyString = serializer.serializeToString(element)
            promises.push(window.fetch(url, { method: "POST", headers: courseRequest.headers, body: bodyString }))
        }

        const responses = await Promise.all(promises)
    })
}

async function main() {

    if(form == null || time_to_add == null)
        return

    const tab = await getTab()
    if (tab.url === undefined)
        return;

    validateLessonButton?.addEventListener("click", validateLesson)

    const product = getProduct(tab.url)

    form.addEventListener("submit", async (e: SubmitEvent) => {
        e.preventDefault()

        if (tab.id === undefined || product === null)
            return;

        const time = new Date(Number(time_to_add.value) * 60 * 1000)

        chrome.storage.session.get([product.name]).then((store) => {
            const values = store[product.name]
            if(!values?.ready)
                return

            if (submit_button == undefined)
                return

            const requests = getTimeRequests(product, time, values.timeRequest)
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

