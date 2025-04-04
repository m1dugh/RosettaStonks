import React, { useState, JSX, useEffect } from "react";
import { Feature, Service } from "../service.ts";
import MissingFeatureBanner from "./MissingFeatureBanner.tsx";

interface IProps {
  service: Service | null;
  onError: (e: Error) => void;
}

const DefaultText = "Add Minutes";

export default function TimeForm({
  service,
  onError,
}: IProps): Promise<JSX.Element> {
  const [time, setTime] = useState<number>(0);
  const [content, setContent] = useState<string>(DefaultText);
  const [available, setAvailable] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    service?.isFeatureReady(Feature.AddTime).then(setAvailable);
  }, [service]);

  const onSubmit: React.FormEventHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (service === null) {
      onError(new Error("Invalid service"));
      return;
    }
    console.info("Adding", time, "minutes");
    setContent("Processing...");
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      await service.addTime(new Date(time * 60 * 1000));
      setTime(0);
      setSuccessMessage("Time added successfully!");
    } catch (e) {
      onError(e as Error);
    } finally {
      setContent(DefaultText);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="time-form">
      {available ? (
        <form onSubmit={onSubmit}>
          <input
            type="number"
            min="0"
            placeholder="Enter time to add (in minutes)"
            onChange={(e) => setTime(Number(e.target.value) || 0)}
            value={time}
            disabled={!available || isSubmitting}
          />
          <button type="submit" disabled={time <= 0 || isSubmitting}>
            {content}
          </button>
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          {time <= 0 && (
            <p className="error-message">Please enter a valid time.</p>
          )}
        </form>
      ) : (
        <MissingFeatureBanner message="Add Time feature is unavailable" />
      )}
      <style jsx>{`
        .success-message {
          color: green;
          font-weight: bold;
        }
        .error-message {
          color: red;
          font-weight: bold;
        }
        .time-form {
          font-family: Arial, sans-serif;
        }
        input {
          padding: 8px;
          margin: 8px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
