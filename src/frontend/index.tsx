import ReactDOM from "react-dom/client"
import React, { JSX, useEffect, useState } from "react"
import TimeForm from "./components/TimeForm.tsx"
import ValidateForm from "./components/ValidateForm.tsx"
import { getService, Service } from "./service.ts";
import ErrorBanner from "./components/ErrorBanner.tsx";
import GitHubButton from "npm:react-github-btn"

function App(): JSX.Element {
    const [service, setService] = useState<Service | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        getService().then(setService).catch(setError)
    }, [])

    const onClearCache = async () => {
        await browser.storage.session.clear()
    }

    return (<>
        <div className="top">
            <h1>Rosetta stonks</h1>
        </div>
        <ErrorBanner error={error} />
        <TimeForm service={service} onError={setError} />
        <ValidateForm service={service} onError={setError} />
        <div className="clear-cache">
            <button onClick={onClearCache}>clear cache</button>
        </div>
        <div className="extra-bar">
            <GitHubButton
                href="https://github.com/m1dugh/RosettaStonks"
                data-color-scheme="no-preference: dark; light: light; dark: dark;"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star m1dugh/RosettaStonks on GitHub" >
                Star
            </GitHubButton>
            <GitHubButton href="https://github.com/m1dugh/RosettaStonks/issues" data-color-scheme="no-preference: dark; light: light; dark: dark;" data-icon="octicon-issue-opened" data-size="large" data-show-count="true" aria-label="Issue m1dugh/RosettaStonks on GitHub">Issue</GitHubButton>
        </div>
    </>)
}

const root = document.querySelector("#root")

ReactDOM.createRoot(root).render(<App />)
