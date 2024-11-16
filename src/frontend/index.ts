import { FoundationsTimeRequestKey } from "../lib/env.ts"

const root = document.querySelector("#root")
root.innerText = "hello world"

setInterval(async () => {
    const req = await browser.storage.session.get(FoundationsTimeRequestKey)
    console.log("found request", req)
}, 1000)
