import React from "react";

interface FormattedDateProps {
  timestamp?: string;
  className?: string;
  fallback?: string;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ 
  timestamp, 
  className = "", 
  fallback = "Recently" 
}) => {
  const formatDate = (ts?: string) => {
    if (!ts) return fallback;
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;

      const now = new Date();
      const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return ts;
    }
  };

  return <span className={className}>{formatDate(timestamp)}</span>;
};

export default FormattedDate;
