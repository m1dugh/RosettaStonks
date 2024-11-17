import React, {JSX, useEffect, useState} from "react";

interface IProps {
    error: Error | null;
}

let timeout: number | undefined;

export default function ErrorBanner({error}: IProps): JSX.Element {
    const [showed, setShowed] = useState<boolean>(false)

    useEffect(() => {
        if (error === null) {
           setShowed(false) 
           return
        }

        console.error(error.message)

        setShowed(true)
        if (timeout !== undefined)
            clearTimeout(timeout)

        timeout = setTimeout(() => {
            setShowed(false)
        }, 3000)

    }, [error])

    const classes = ["error-banner", showed ? "active" : null].filter(v => v != null).join(" ")

    return (<div className={classes} onClick={() => setShowed(false)}>
        {error?.message}
    </div>)
}
