import { AlertCircle } from "lucide-react";
import { SVGLoader } from "./SVGLoader";

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
const SVGLoaderFetch = ({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) => (
  <tr>
    <td colSpan={colSpan} className="h-[300px] p-0 m-auto">
      <div className="center-content flex flex-col justify-center items-center h-full">
        <SVGLoader width={"40px"} height={"40px"} color={"#0866FF"} />
        <p className="mt-3">{text}</p>
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

export {
  getTypeColor,
  SVGLoaderFetch,
  NoRecordFound,
  getRoleBadge,
  getStatusBadge,
  formatDate,
};
