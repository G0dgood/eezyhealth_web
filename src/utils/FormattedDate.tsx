"use client";
import React from "react";

interface FormattedDateProps {
  timestamp?: any; // Firebase Timestamp, Date, or string
  withTime?: boolean;
}

const FormattedDate: React.FC<FormattedDateProps> = ({
  timestamp,
  withTime = true,
}) => {
  if (!timestamp) return <>—</>;

  let date: Date | null = null;

  try {
    // Handle Firestore Timestamp objects
    if (timestamp?._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string") {
      // Handle string format (like from Firestore console)
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) date = parsed;
    }
  } catch {
    date = null;
  }

  if (!date) return <>—</>;

  const options: Intl.DateTimeFormatOptions = withTime
    ? {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

  return <>{date.toLocaleString("en-US", options)}</>;
};

export default FormattedDate;
