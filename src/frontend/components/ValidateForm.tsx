import React, {  JSX, useEffect, useState } from "react"
import { Feature, Service } from "../service.ts";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

export default function ValidateForm({service, onError}: IProps): JSX.Element {

    const [enabled, setEnabled] = useState<boolean>(true);
    const [available, setAvailable] = useState<boolean>(false);

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
        try {
            await service.validateLesson()
        } catch (e) {
            onError(e as Error)
        } finally {
            setEnabled(true)
        }
    }

    const disabled = !enabled || !available

    return (<div className="validate-form">
        <button onClick={onClick} disabled={disabled}>validate lesson</button>
    </div>)
}
