import React from "react";
import { Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useGetBookingsQuery } from "@/store/api";
import FormattedDate from "@/utils/FormattedDate";

interface Booking {
  bookingId?: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  bookingDate?: {
    _seconds: number;
    _nanoseconds: number;
  };
  slot?: string;
  bookingChannel?: string;
  specialization?: string;
  bookingStatus?: string;
  status?: string;
}

const BookingList = () => {
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({});



  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter bookings based on search term
  const filteredBookings = useMemo(() => {
    if (!bookings?.bookings) return [];

    if (!searchTerm.trim()) return bookings.bookings;

    return bookings.bookings.filter((booking: Booking) => {
      return (
        booking.bookingStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingChannel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.slot?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [bookings?.bookings, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <div className="relative flex-1 max-w-md mb-6">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patient, doctor, specialty, channel or time slot"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      {/* Bookings Table */}
      {isLoading ? (
        <TableSkeleton
          columns={7}
          rows={5}
          headerLabels={[
            "Patient Name",
            "Doctor",
            "Date",
            "Time",
            "Channel",
            "Specialty",
            "Status",
          ]}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings?.length === 0 ? (
                  <NoRecordFound colSpan={7} />
                ) : (
                  paginatedBookings.map((booking: Booking, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-medium">
                          {booking?.patientName || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking?.doctorName || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking?.bookingDate ? (
                          <FormattedDate timestamp={booking.bookingDate} />
                        ) : booking?.date ? (
                          <FormattedDate timestamp={booking.date} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking?.slot ? (
                          <span className="capitalize">
                            {booking.slot.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ) : booking?.time ? (
                          booking.time
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking?.bookingChannel || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking?.specialization || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${booking.bookingStatus === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                          {booking.bookingStatus || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredBookings.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
