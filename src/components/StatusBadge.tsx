"use client";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = (status || "").toLowerCase();

  const getStatusColors = () => {
    if (s === "accepted" || s === "confirmed" || s === "approved" || s === "completed" || s === "success") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (s === "pending" || s === "passed" || s === "passed appointment") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    if (s === "upcoming") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "cancelled" || s === "canceled" || s === "failed") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (s === "rescheduled") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-red-50 text-red-700 border-red-200";
  };

  const displayStatus = s === "passed" ? "Passed" : (status || "—");

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColors()} ${className} capitalize`}
    >
      {displayStatus}
    </span>
  );
}
