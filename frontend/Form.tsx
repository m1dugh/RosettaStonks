import React, { MouseEventHandler, useState } from "react";
import ServiceFactory from "@common/service.ts"

export default function Form() {
    const [amount, setAmount] = useState<number>(0);
    const [errorState, setErrorState] = useState<boolean | null>(false);
    const minutes = amount % 60;
    const hours = (amount - minutes) / 60;
    const service = ServiceFactory.getService()

    const onSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        if (service === null || amount === 0)
            return
        setErrorState(null)
        service
            .addTime(amount * 60)
            .then(() => setErrorState(false))
            .catch(() => setErrorState(true))
        setAmount(0)
    }

    const onDecrease: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        if (service === null || amount === 0)
            return
        setErrorState(null)
        service
            .decreaseTime(amount * 60)
            .then(() => setErrorState(false))
            .catch(() => setErrorState(true))
        setAmount(0)
    }

    const onChange = (value: number) => {
        if (value === undefined || isNaN(value) || value < 0) {
            setAmount(0)
            return
        }
        setAmount(value)
    }

    let buttonMessage = "add time"
    if (errorState === null)
        buttonMessage = "..."
    else if (errorState === true)
        buttonMessage = "error"

    return (
        <div className="form">
            <input type="number" min="0" value={amount.toString()} onChange={(e) => onChange(parseInt(e.target.value))}/>
            <span>
                Hours: {hours.toString().padStart(2, '0')} Minutes: {minutes.toString().padStart(2, '0')}
            </span>
            <button type="submit" disabled={service === null || amount === 0} onClick={onSubmit}>
                { buttonMessage }
            </button>
            <button type="button" disabled={service === null || amount === 0} onClick={onDecrease}>
                decrease time
            </button>
        </div>
    )
}