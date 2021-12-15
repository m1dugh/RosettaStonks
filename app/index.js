const status = document.getElementById("status")
const timeCounter = document.getElementById("timeCounter");

const [form] = document.getElementsByTagName("form");
const timeInput = form.firstElementChild;


let appReady = false;

function print_data(data) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then(([tab]) => {
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: (data) => console.log(data),
            args: [data]
        }, () => null)
    });
}


chrome.storage.onChanged.addListener(UpdateStatusPanel)
window.onload = async () => {
    UpdateStatusPanel();
    timeInput.addEventListener("change", (e) => {
        e.preventDefault()
        const value = parseInt(e.target.value)
        if (value <= 0 || isNaN(value)) {
            timeInput.value = 1;
        } else {
            timeInput.value = value;
        }
    })


    form.onsubmit = (e) => {
        e.preventDefault()
        if (!appReady)
            return

        const minutes = parseInt(timeInput.value);
        if (minutes <= 0 || isNaN(minutes))
            return;

        const maxRequestCount = Math.floor(minutes / 20);
        const lastRequestMinutes = minutes % 20;
        for (let i = 0; i < maxRequestCount; i++)
            SendRequest();
        if (lastRequestMinutes !== 0)
            SendRequest(lastRequestMinutes);
    };
}

function SendRequest(minutes = 20) {
    chrome.storage.sync.get(["request"], async ({request}) => {
        const body = new DOMParser().parseFromString(request.body, "text/xml");
        const time = minutes * 60 * 1000;
        body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = time.toString()
        body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString()

        const rootTag = body.documentElement.tagName
        const data = `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`


        request.headers["Access-Control-Allow-Origin"]= "*"

        fetch(request.url, {
            method: "POST",
            headers: request.headers,
            body: data
        }).then((res) => print_data(res.status))
            .catch((err) => print_data(err.stack))

        print_data({url: request.url, data, headers: request.headers})

    })
}


function UpdateStatusPanel() {
    chrome.storage.sync.get(["request", "ready"], ({request, ready}) => {
        status.innerText = ready ? "ready" : "not ready";
        appReady = ready;
        form.childNodes.forEach((el) => {
            el.disabled = !ready;
        })
        if (ready) {
            const format = new Intl.NumberFormat("en-US", {
                minimumIntegerDigits: 2,
                maximumFractionDigits: 0
            });
            const offset = (Date.now() - request.timestamp) / 1000
            const [hours, minutes] = [
                format.format(offset / 3600),
                format.format((offset / 60) % 60)
            ]
            timeCounter.innerText = `${hours}h${minutes}m`
        }

    })
}
