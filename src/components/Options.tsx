import { AlertCircle } from "lucide-react";
import { SVGLoader } from "./SVGLoader";
import { Star } from "lucide-react";

const getTypeColor = (type: string) => {
  switch (type) {
    case "Video":
      return "bg-blue-100 text-blue-800";
    case "Chat":
      return "bg-orange-100 text-orange-800";
    case "Call":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleBadge = (role: string) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

  switch (role) {
    case "ADMIN":
      return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
    case "DOCTOR":
      return `${baseClasses} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200`;
    case "NURSE":
      return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
    case "PATIENT":
      return `${baseClasses} bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200`;
    default:
      return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
  }
};

const getStatusBadge = (isActive: boolean) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

  return isActive
    ? `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`
    : `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
};

// SVGLoader Fetch
const SVGLoaderFetch = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="h-[300px] p-0 m-auto">
      <div className="center-content flex flex-col justify-center items-center h-full">
        <SVGLoader width={"40px"} height={"40px"} color={"#22c55e"} />
      </div>
    </td>
  </tr>
);

// NoRecordFound
const NoRecordFound = ({ colSpan }: { colSpan: number }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="h-[300px] p-0 m-auto border-b-0">
        <div className="center-content flex flex-col justify-center items-center h-full">
          <AlertCircle size={75} color={"#a4a9b2"} />
          <p id="mt-3 !underline-none" style={{ color: "#6B7280" }}>
            No record found
          </p>
        </div>
      </td>
    </tr>
  );
};

const formatDate = (
  timestamp: string | number | { seconds: number } | null | undefined
) => {
  if (!timestamp) return "N/A";
  try {
    if (
      typeof timestamp === "object" &&
      "seconds" in timestamp &&
      timestamp.seconds
    ) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      return new Date(timestamp).toLocaleDateString();
    }
    return "N/A";
  } catch {
    return "N/A";
  }
};

const topDoctorColors = [
  "bg-[#EAF2C0]",
  "bg-[#D2EDCD]",
  "bg-[#E9E3EA]",
  "bg-[#EBF2D8]",
  "bg-[#DBE1EA]",
  "bg-[#EBE9E7]",
  "bg-[#D1F1D9]",
  "bg-[#DDE4C1]",
];
const topDoctorMainColors = [
  "bg-[#EDF115]",
  "bg-[#44CE2D]",
  "bg-[#E015F1]",
  "bg-[#F17115]",
  "bg-[#2715F1]",
  "bg-[#FE0BAB]",
  "bg-[#75EC9E]",
  "bg-[#9C9F00]",
];

const communicationChannels = [
  "Video Consultation",
  "Chat Consultation",
  "Voice Call",
  "In-Person",
  "Online",
  "Face to Face",
];

// Get day name from date
const getDayName = (date: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

const renderStars = (rating: number) => {
  if (!rating) return null;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${
          i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    );
  }
  return stars;
};

const formatTime = (timeSlot: string) => {
  return timeSlot
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

export {
  getTypeColor,
  SVGLoaderFetch,
  NoRecordFound,
  getRoleBadge,
  getStatusBadge,
  formatDate,
  getDayName,
  renderStars,
  formatTime,
  topDoctorColors,
  topDoctorMainColors,
  communicationChannels,
};
