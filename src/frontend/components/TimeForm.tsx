import React, { useState, useEffect, FormEvent } from "react";
import { Feature, Service } from "../service.ts";
import MissingFeatureBanner from "./MissingFeatureBanner.tsx";

interface TimeFormProps {
  service: Service;
  onError: (error: Error) => void;
}

export default function TimeForm({
  service,
  onError,
}: TimeFormProps): JSX.Element {
  const [minutes, setMinutes] = useState<number>(0);
  const [available, setAvailable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState<boolean>(false);

  // Check feature availability
  useEffect(() => {
    if (!service) return;
    let mounted = true;
    service
      .isFeatureReady(Feature.AddTime)
      .then((ready) => mounted && setAvailable(ready))
      .catch(() => mounted && setAvailable(false));
    return () => {
      mounted = false;
    };
  }, [service]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (minutes <= 0) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // Convert minutes to milliseconds as Date argument if needed
      await service.addTime(new Date(minutes * 60 * 1000));
      setMinutes(0);
      setSuccessMessage("Time added successfully!");
      setTouched(false);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLabel = isSubmitting ? "Processing..." : "Add Minutes";
  const showError = touched && minutes <= 0;

  if (!available) {
    return <MissingFeatureBanner message="Add Time feature is unavailable" />;
  }

  return (
    <div className="time-form">
      <form onSubmit={handleSubmit} className="form">
        <input
          type="number"
          min={0}
          placeholder="Enter minutes"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          onBlur={() => setTouched(true)}
          disabled={isSubmitting}
          className="input"
        />
        <button type="submit" disabled={isSubmitting} className="button">
          {buttonLabel}
        </button>
        {successMessage && (
          <p role="status" className="success-message">
            {successMessage}
          </p>
        )}
        {showError && (
          <p role="alert" className="error-message">
            Please enter a valid number of minutes.
          </p>
        )}
      </form>

      <style jsx>{`
        .time-form {
          font-family: Arial, sans-serif;
          max-width: 300px;
          margin: auto;
        }
        .input {
          width: 100%;
          padding: 8px;
          margin-bottom: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .button {
          width: 100%;
          padding: 8px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .success-message {
          color: green;
          font-weight: bold;
          margin-top: 8px;
        }
        .error-message {
          color: red;
          font-weight: bold;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
