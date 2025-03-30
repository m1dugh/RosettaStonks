import React from "react";

interface IProps {
  message: string;
}

export default function ({ message }: IProps) {
  return (
    <p className="warning-form">
      Do at least one exercise in order to {message}
    </p>
  );
}
