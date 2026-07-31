"use client";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = (status || "").toLowerCase();

  const getStatusColors = () => {
    if (s === "accepted" || s === "confirmed" || s === "approved") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (s === "pending") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColors()} ${className}`}
    >
      {status || "—"}
    </span>
  );
}
