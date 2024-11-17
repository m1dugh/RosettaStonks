import ReactDOM from "react-dom/client"
import React, { JSX, useEffect, useState } from "react"
import TimeForm from "./components/TimeForm.tsx"
import ValidateForm from "./components/ValidateForm.tsx"
import { getService, Service } from "./service.ts";

function App(): JSX.Element {
    const [service, setService] = useState<Service | null>(null)

    useEffect(() => {
        getService().then(setService).catch((e) => console.error(e))
    }, [])

    return (<>
        <TimeForm service={service} onError={console.error} />
        <ValidateForm service={service} onError={console.error} />
    </>)
}

const root = document.querySelector("#root")

ReactDOM.createRoot(root).render(<App />)
