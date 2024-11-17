import React, {  JSX, useEffect, useState } from "react"
import { Feature, Service } from "../service.ts";
import MissingFeatureBanner from "./MissingFeatureBanner.tsx";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

export default function ValidateForm({service, onError}: IProps): JSX.Element {

    const [enabled, setEnabled] = useState<boolean>(true);
    const [available, setAvailable] = useState<boolean>(false);
    const [content, setContent] = useState<string>("validate lesson")

    useEffect(() => {
        service?.isFeatureReady(Feature.ValidateLesson)
            .then(setAvailable)
    }, [service])

    const onClick = async () => {
        if (service === null) {
            onError(new Error("No service found"))
            return
        }
        console.debug("validating lesson")
        setEnabled(false)
        setContent("...")
        try {
            await service.validateLesson()
        } catch (e) {
            onError(e as Error)
        } finally {
            setContent("validate lesson")
            setEnabled(true)
        }
    }

    return (<div className="validate-form">
        {
            available ? ( <button onClick={onClick} disabled={!enabled}>{content}</button>)
            : (<MissingFeatureBanner message="validate lesson"/>)
        }
        
    </div>)
}
