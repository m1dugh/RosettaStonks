import React, { useState, JSX, useEffect } from "react"
import { Feature, Service } from "../service.ts";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

export default function TimeForm({service, onError}: IProps): Promise<JSX.Element> {

    const [time, setTime] = useState<number>(0)
    const [content, setContent] = useState<string>("submit")
    const [available, setAvailable] = useState<boolean>(false);

    useEffect(() => {
        service?.isFeatureReady(Feature.AddTime)
            .then(setAvailable)
    }, [service])

    const onSubmit: React.FormEventHandler = async (e: React.FormEvent) => {
        e.preventDefault()
        if (service === null) {
            onError(new Error("Invalid service"))
            return
        }
        console.info("Adding", time, "minutes")
        setContent("...")
        try {
            await service.addTime(new Date(time * 60 * 1000))
            setTime(0)
        } catch(e) {
            onError(e as Error)
        } finally {
            setContent("submit")
        }
    }

    const disabled = time <= 0
        || !available

    return (
        <div className="time-form">
            <form onSubmit={onSubmit}>
                <input type="number" min="0" placeholder="time to add (minutes)" onChange={(e) => setTime(e.target.value || 0)} value={time} disabled={!available}/>
                <button type="submit" disabled={disabled}>{content}</button>
            </form>
        </div>
    )
}
