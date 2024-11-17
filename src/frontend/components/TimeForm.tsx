import React, { useState, JSX } from "react"
import { Service } from "../service.ts";

interface IProps {
    service: Service | null;
    onError: (e: Error) => void;
}

export default function TimeForm({service, onError}: IProps): Promise<JSX.Element> {

    const [time, setTime] = useState<number>(0)
    const [content, setContent] = useState<string>("submit")

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

    return (
        <>
            <form onSubmit={onSubmit}>
                <input type="number" min="0" placeholder="time to add (minutes)" onChange={(e) => setTime(e.target.value || 0)} value={time}/>
                <button type="submit" disabled={time <= 0}>{content}</button>
            </form>
        </>
    )
}
