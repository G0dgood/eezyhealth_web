import { AlertCircle, Video } from "lucide-react";
import { SVGLoader } from "./SVGLoader";
import { Star, MessageCircle, Phone, Calendar, User } from "lucide-react";

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
    case "admin":
      return `${baseClasses} bg-red-100 text-red-800`;
    case "doctor":
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case "nurse":
      return `${baseClasses} bg-green-100 text-green-800`;
    case "patient":
      return `${baseClasses} bg-purple-100 text-purple-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getStatusBadge = (isActive: boolean) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

  return isActive
    ? `${baseClasses} bg-green-100 text-green-800`
    : `${baseClasses} bg-red-100 text-red-800`;
};

const getCancellationStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();

  let bgColor = "";
  let textColor = "";

  switch (statusLower) {
    case "approved":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "rejected":
    case "denied":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "cancelled":
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      break;
    default:
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
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
        className={`w-4 h-4 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
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

const convertSlotToTime = (slot: string | null | undefined): string => {
  if (!slot || typeof slot !== "string") return "09:00 AM"; // Default fallback

  // Convert slot formats to match timeSlots array format
  if (slot.includes("night_11pm")) return "11:00 PM";
  if (slot.includes("night_11:30pm")) return "11:30 PM";
  if (slot.includes("night_10pm")) return "10:00 PM";
  if (slot.includes("night_10:30pm")) return "10:30 PM";
  if (slot.includes("night_9pm")) return "09:00 PM";
  if (slot.includes("night_9:30pm")) return "09:30 PM";
  if (slot.includes("night_8pm")) return "08:00 PM";
  if (slot.includes("night_8:30pm")) return "08:30 PM";
  if (slot.includes("night_7pm")) return "07:00 PM";
  if (slot.includes("night_7:30pm")) return "07:30 PM";
  if (slot.includes("night_6pm")) return "06:00 PM";
  if (slot.includes("night_6:30pm")) return "06:30 PM";
  if (slot.includes("afternoon_5pm")) return "05:00 PM";
  if (slot.includes("afternoon_5:30pm")) return "05:30 PM";
  if (slot.includes("afternoon_4pm")) return "04:00 PM";
  if (slot.includes("afternoon_4:30pm")) return "04:30 PM";
  if (slot.includes("afternoon_3pm")) return "03:00 PM";
  if (slot.includes("afternoon_3:30pm")) return "03:30 PM";
  if (slot.includes("afternoon_2pm")) return "02:00 PM";
  if (slot.includes("afternoon_2:30pm")) return "02:30 PM";
  if (slot.includes("afternoon_1pm")) return "01:00 PM";
  if (slot.includes("afternoon_1:30pm")) return "01:30 PM";
  if (slot.includes("morning_12pm")) return "12:00 PM";
  if (slot.includes("morning_12:30pm")) return "12:30 PM";
  if (slot.includes("morning_11am")) return "11:00 AM";
  if (slot.includes("morning_11:30am")) return "11:30 AM";
  if (slot.includes("morning_10am")) return "10:00 AM";
  if (slot.includes("morning_10:30am")) return "10:30 AM";
  if (slot.includes("morning_9am")) return "09:00 AM";
  if (slot.includes("morning_9:30am")) return "09:30 AM";
  if (slot.includes("morning_8am")) return "08:00 AM";
  if (slot.includes("morning_8:30am")) return "08:30 AM";
  if (slot.includes("morning_7am")) return "07:00 AM";
  if (slot.includes("morning_7:30am")) return "07:30 AM";
  if (slot.includes("morning_6am")) return "06:00 AM";
  if (slot.includes("morning_6:30am")) return "06:30 AM";
  if (slot.includes("morning_5am")) return "05:00 AM";
  if (slot.includes("morning_5:30am")) return "05:30 AM";
  if (slot.includes("morning_4am")) return "04:00 AM";
  if (slot.includes("morning_4:30am")) return "04:30 AM";
  if (slot.includes("morning_3am")) return "03:00 AM";
  if (slot.includes("morning_3:30am")) return "03:30 AM";
  if (slot.includes("morning_2am")) return "02:00 AM";
  if (slot.includes("morning_2:30am")) return "02:30 AM";
  if (slot.includes("morning_1am")) return "01:00 AM";
  if (slot.includes("morning_1:30am")) return "01:30 AM";
  if (slot.includes("morning_12am")) return "12:00 AM";
  if (slot.includes("morning_12:30am")) return "12:30 AM";
  // If it's already in the correct format, return as is
  if (slot.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) return slot;
  return "09:00 AM"; // Default fallback
};

const timeSlots = [
  { key: "midnight_12am", from: "12:00 AM", to: "01:00 AM" },
  { key: "early_morning_1am", from: "01:00 AM", to: "02:00 AM" },
  { key: "early_morning_2am", from: "02:00 AM", to: "03:00 AM" },
  { key: "early_morning_3am", from: "03:00 AM", to: "04:00 AM" },
  { key: "early_morning_4am", from: "04:00 AM", to: "05:00 AM" },
  { key: "early_morning_5am", from: "05:00 AM", to: "06:00 AM" },
  { key: "morning_6am", from: "06:00 AM", to: "07:00 AM" },
  { key: "morning_7am", from: "07:00 AM", to: "08:00 AM" },
  { key: "morning_8am", from: "08:00 AM", to: "09:00 AM" },
  { key: "morning_9am", from: "09:00 AM", to: "10:00 AM" },
  { key: "morning_10am", from: "10:00 AM", to: "11:00 AM" },
  { key: "morning_11am", from: "11:00 AM", to: "12:00 PM" },
  { key: "afternoon_12pm", from: "12:00 PM", to: "01:00 PM" },
  { key: "afternoon_1pm", from: "01:00 PM", to: "02:00 PM" },
  { key: "afternoon_2pm", from: "02:00 PM", to: "03:00 PM" },
  { key: "afternoon_3pm", from: "03:00 PM", to: "04:00 PM" },
  { key: "afternoon_4pm", from: "04:00 PM", to: "05:00 PM" },
  { key: "evening_5pm", from: "05:00 PM", to: "06:00 PM" },
  { key: "evening_6pm", from: "06:00 PM", to: "07:00 PM" },
  { key: "evening_7pm", from: "07:00 PM", to: "08:00 PM" },
  { key: "evening_8pm", from: "08:00 PM", to: "09:00 PM" },
  { key: "night_9pm", from: "09:00 PM", to: "10:00 PM" },
  { key: "night_10pm", from: "10:00 PM", to: "11:00 PM" },
  { key: "night_11pm", from: "11:00 PM", to: "12:00 AM" },
];

// Update the month display
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Color Functions
const getRandomColor = () => {
  const colors = [
    "#00539C",
    "#00A52C",
    "#FF8C00",
    "#C67003",
    "#14539A",
    "#462A68",
    "#02393E",
    "#275D2B",
    "#660D33",
    "#6F4439",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getContrastingColor = (color: string) => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const invertedColor = `#${(0xffffff ^ ((r << 16) | (g << 8) | b))
    .toString(16)
    .padStart(6, "0")}`;
  return invertedColor;
};

const getBookingColor = (channel: string) => {
  switch (channel) {
    case "videoCall":
      return "bg-green-500";
    case "chat":
      return "bg-blue-500";
    case "voiceCall":
      return "bg-purple-500";
    case "physical":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "videoCall":
      return <Video className="w-3 h-3" />;
    case "chat":
      return <MessageCircle className="w-3 h-3" />;
    case "voiceCall":
      return <Phone className="w-3 h-3" />;
    case "physical":
      return <User className="w-3 h-3" />;
    default:
      return <Calendar className="w-3 h-3" />;
  }
};

export {
  getChannelIcon,
  getBookingColor,
  getTypeColor,
  SVGLoaderFetch,
  NoRecordFound,
  getRoleBadge,
  getStatusBadge,
  getCancellationStatusBadge,
  formatDate,
  getDayName,
  renderStars,
  formatTime,
  convertSlotToTime,
  getRandomColor,
  getContrastingColor,
  timeSlots,
  monthNames,
  topDoctorColors,
  topDoctorMainColors,
  communicationChannels,
};
