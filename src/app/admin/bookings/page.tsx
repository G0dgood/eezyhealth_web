"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Title from "@/components/Title";
import FilterModal from "@/components/modals/FilterModal";
import SearchInput from "@/components/SearchInput";
import { useGetBookingsQuery } from "@/store/api";
import { toast } from "sonner";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";
import moment from "moment";

interface Booking {
  id: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: "pending" | "completed" | "cancelled";
  channel: "chat" | "videoCall" | "voiceCall";
}

// Use mock data as fallback if API fails
const mockData: Booking[] = [
  {
    id: "1",
    patientName: "Seun Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Tunde Simeon",
    specialty: "Dentist",
    status: "pending",
    channel: "chat",
  },
  {
    id: "2",
    patientName: "Felix Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Ernest Simeon",
    specialty: "ENT",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "3",
    patientName: "Kofi Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Godwin Simeon",
    specialty: "Optician",
    status: "cancelled",
    channel: "voiceCall",
  },
  {
    id: "4",
    patientName: "Fatima Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Daniel Simeon",
    specialty: "Dentist",
    status: "cancelled",
    channel: "voiceCall",
  },
  {
    id: "5",
    patientName: "Joy Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Seun Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "6",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Felix Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "7",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Kofi Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "8",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Fatima Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "9",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Joy Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "10",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Tolu Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
  {
    id: "11",
    patientName: "Tolu Simeon",
    date: "2 January 2025",
    time: "8:00AM",
    doctor: "Dr. Abbey Simeon",
    specialty: "Dentist",
    status: "completed",
    channel: "videoCall",
  },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: "pending" as "pending" | "completed" | "cancelled" | "",
    channel: "chat" as "chat" | "videoCall" | "voiceCall" | "",
  });

  // Fetch bookings from API
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({});

  const itemsPerPage = 10;
  const totalPages = Math.ceil(
    (bookings?.length || mockData.length) / itemsPerPage
  );

  // Apply search and filters
  const filteredData = bookings?.bookings?.filter(
    (booking: { bookingStatus: string }) => {
      const matchesSearch = booking?.bookingStatus
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSearch;
    }
  );

  const paginatedData = filteredData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApplyFilters = (filters: {
    status: "pending" | "completed" | "cancelled" | "";
    channel: "chat" | "videoCall" | "voiceCall" | "";
  }) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setActiveFilters({ status: "", channel: "" });
    setCurrentPage(1);
  };

  // Handle API responses
  useEffect(() => {
    if (error) {
      toast.error("Failed to load bookings. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, refetch]);

  useEffect(() => {
    if (bookings && bookings.length > 0) {
      toast.success(`Successfully loaded ${bookings.length} bookings`);
    }
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium text-white";

    switch (status) {
      case "Pending":
        return `${baseClasses} bg-orange-500`;
      case "Accepted":
        return `${baseClasses} bg-green-500`;
      case "Cancelled":
        return `${baseClasses} bg-red-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  const getChannelText = (channel: string) => {
    switch (channel) {
      case "chat":
        return "Chat";
      case "videoCall":
        return "Video call";
      case "voiceCall":
        return "Voice Call";
      default:
        return channel;
    }
  };

  // Format Firebase timestamp
  const formatFirebaseTimestamp = (
    timestamp:
      | string
      | number
      | { _seconds: number; _nanoseconds: number }
      | null
      | undefined
  ) => {
    if (!timestamp) return "N/A";

    // Handle Firebase timestamp object
    if (
      typeof timestamp === "object" &&
      "_seconds" in timestamp &&
      timestamp._seconds
    ) {
      const formatted = moment.unix(timestamp._seconds).format("DD MMMM YYYY");
      console.log("Formatted date:", formatted, "from timestamp:", timestamp);
      return formatted;
    }

    // Handle regular date string or number
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const formatted = moment(timestamp).format("DD MMMM YYYY");
      console.log("Formatted date:", formatted, "from timestamp:", timestamp);
      return formatted;
    }

    return "N/A";
  };

  // Format Firebase timestamp with time
  const formatFirebaseTimestampWithTime = (
    timestamp:
      | string
      | number
      | { _seconds: number; _nanoseconds: number }
      | null
      | undefined
  ) => {
    if (!timestamp) return "N/A";

    // Handle Firebase timestamp object
    if (
      typeof timestamp === "object" &&
      "_seconds" in timestamp &&
      timestamp._seconds
    ) {
      const formatted = moment
        .unix(timestamp._seconds)
        .format("DD MMMM YYYY, h:mm A");
      console.log(
        "Formatted datetime:",
        formatted,
        "from timestamp:",
        timestamp
      );
      return formatted;
    }

    // Handle regular date string or number
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const formatted = moment(timestamp).format("DD MMMM YYYY, h:mm A");
      console.log(
        "Formatted datetime:",
        formatted,
        "from timestamp:",
        timestamp
      );
      return formatted;
    }

    return "N/A";
  };

  // Check if a field is a Firebase timestamp
  const isFirebaseTimestamp = (
    field: unknown
  ): field is { _seconds: number; _nanoseconds: number } => {
    if (typeof field === "object" && field !== null) {
      const obj = field as Record<string, unknown>;
      return "_seconds" in obj && typeof obj._seconds === "number";
    }
    return false;
  };

  const hasActiveFilters = activeFilters.status || activeFilters.channel;

  return (
    <div>
      <Title title="Booking List" />

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-x-4">
        {/* Search Input */}
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search patient."
        />

        <div className="flex space-x-2">
          {/* Refresh Button */}
          <button
            onClick={() => {
              toast.info("Refreshing bookings...");
              refetch();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
            <span>Refresh</span>
          </button>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? "border-[#44CE2D] bg-[#44CE2D] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}>
            <Filter className="w-4 h-4" />
            <span>filter</span>
          </button>
        </div>
      </div>

      {/* Bookings Summary */}
      {bookings && bookings.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Bookings
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookings.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {bookings.filter((b: Booking) => b.status === "pending").length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b: Booking) => b.status === "completed").length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Cancelled
            </div>
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter((b: Booking) => b.status === "cancelled").length}
            </div>
          </div>
        </div>
      )}

      {/* Table */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PATIENT NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOOKING DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  BOOKING CHANNEL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  SLOT
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOCTOR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SPECIALIZATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CHANNEL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <SVGLoaderFetch colSpan={7} text="Loading users..." />
              ) : paginatedData?.length === 0 ||
                paginatedData?.length === undefined ? (
                <NoRecordFound colSpan={7} />
              ) : (
                paginatedData?.map(
                  (booking: {
                    id: string;
                    patientName: string;
                    bookingDate: string;
                    bookingChannel: string;
                    doctorName: string;
                    specialization: string;
                    bookingStatus: string;
                    channel: string;
                    slot: string;
                  }) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking?.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatFirebaseTimestamp(booking?.bookingDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {booking?.bookingChannel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {isFirebaseTimestamp(booking?.slot)
                            ? formatFirebaseTimestampWithTime(booking.slot)
                            : booking?.slot || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking?.doctorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {booking.specialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(booking.bookingStatus)}>
                          {booking?.bookingStatus?.charAt(0).toUpperCase() +
                            booking?.bookingStatus?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getChannelText(booking.bookingChannel)}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
}
