import { setupListeners } from "./request.ts"

setupListeners()

console.log("Hello, World")

browser.storage.session.set({"hello": "world"}).then(() => console.log("pushed to storage")).catch(console.error)
