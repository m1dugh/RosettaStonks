import React, { useEffect, useState } from "react";

interface IProps {
    error: Error | null;
}

const ErrorBanner: React.FC<IProps> = ({ error }) => {
    const [showed, setShowed] = useState<boolean>(false);

    useEffect(() => {
        if (error === null) {
            setShowed(false);
            return;
        }

        console.error(error.message);
        setShowed(true);

        const timeout = setTimeout(() => {
            setShowed(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [error]);

    const classes = ["error-banner", showed ? "active" : null].filter(Boolean).join(" ");

    return (
        <div className={classes} onClick={() => setShowed(false)}>
            {error?.message}
        </div>
    );
};

export default ErrorBanner;
