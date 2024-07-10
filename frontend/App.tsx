import Form from "./Form";
import React from "react";
import ReactDOM from "react-dom/client";

import Header from './Header'


export default function App()
{
    return (
    <div className="root-container">
        <Header/>
        <Form />
    </div>
    )
}

const root = ReactDOM.createRoot(document.querySelector("#root"))

root.render(<App />)
