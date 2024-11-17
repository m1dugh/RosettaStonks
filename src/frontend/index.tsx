import ReactDOM from "react-dom/client"
import React, { JSX, useEffect, useState } from "react"
import TimeForm from "./components/TimeForm.tsx"
import ValidateForm from "./components/ValidateForm.tsx"
import { getService, Service } from "./service.ts";
import ErrorBanner from "./components/ErrorBanner.tsx";

function App(): JSX.Element {
    const [service, setService] = useState<Service | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        getService().then(setService).catch((e) => console.error(e))
    }, [])

    return (<>
        <ErrorBanner error={error} />
        <TimeForm service={service} onError={setError} />
        <ValidateForm service={service} onError={setError} />
    </>)
}

const root = document.querySelector("#root")

ReactDOM.createRoot(root).render(<App />)
