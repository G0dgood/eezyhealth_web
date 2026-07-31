"use client";

interface RoleBadgeProps {
  role?: string;
  className?: string;
}

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const r = (role || "").toLowerCase();

  const getBadgeColors = () => {
    if (r === "admin") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (r === "doctor") return "bg-blue-50 text-blue-700 border-blue-200";
    if (r === "nurse") return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <span
      className={`text-[8px] md:text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getBadgeColors()} ${className}`}
    >
      {role || "User"}
    </span>
  );
}
