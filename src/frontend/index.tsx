import ReactDOM from "react-dom/client";
import React, { JSX, useEffect, useState } from "react";
import TimeForm from "./components/TimeForm.tsx";
import ValidateForm from "./components/ValidateForm.tsx";
import { getService, Service } from "./service.ts";
import ErrorBanner from "./components/ErrorBanner.tsx";

function App(): JSX.Element {
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getService().then(setService).catch(setError);
  }, []);

  const onClearCache = async () => {
    await browser.storage.session.clear();
  };

  return (
    <>
      <div className="top">
        <h1>Rosetta stonks</h1>
      </div>
      <ErrorBanner error={error} />
      <TimeForm service={service} onError={setError} />
      <ValidateForm service={service} onError={setError} />
      <div className="clear-cache">
        <button onClick={onClearCache}>clear cache</button>
      </div>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=m1dugh&repo=rosettatonks&type=star&count=true&size=large"
        frameborder="0"
        scrolling="0"
        width="170"
        height="30"
        title="GitHub"
      ></iframe>
    </>
  );
}

const root = document.querySelector("#root");

ReactDOM.createRoot(root).render(<App />);
