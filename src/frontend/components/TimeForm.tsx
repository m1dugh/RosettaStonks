import React, { useState, JSX, useEffect } from "react"
import { Feature, Service } from "../service.ts";
import MissingFeatureBanner from "./MissingFeatureBanner.tsx";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

const DefaultText = "add minutes"

export default function TimeForm({service, onError}: IProps): Promise<JSX.Element> {

    const [time, setTime] = useState<number>(0)
    const [content, setContent] = useState<string>(DefaultText)
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
            setContent(DefaultText)
        }
    }

    return (
        <div className="time-form">
        {
        available ? (
             <form onSubmit={onSubmit}>
                 <input type="number" min="0" placeholder="time to add (minutes)" onChange={(e) => setTime(e.target.value || 0)} value={time} disabled={!available}/>
                 <button type="submit" disabled={time <= 0}>{content}</button>
             </form>
            ) : (<MissingFeatureBanner message="add time"/>)
            
        }
        </div>
    )
}
