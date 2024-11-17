import React, {  JSX, useState } from "react"
import { Service } from "../service.ts";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

export default function ValidateForm({service, onError}: IProps): JSX.Element {

    const [enabled, setEnabled] = useState<boolean>(true);

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
    return (<div className="validate-form">
        <button onClick={onClick} disabled={!enabled}>validate lesson</button>
    </div>)
}
