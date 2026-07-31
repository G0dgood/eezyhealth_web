import React from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";
import { useState, useEffect, useMemo } from "react";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useGetBookingsQuery } from "@/store/bookingApi";
import FormattedDate from "@/utils/FormattedDate";
import Pagination from "@/components/Pagination";
import StatusBadge from "@/components/StatusBadge";

interface Booking {
  bookingId?: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  bookingDate?: {
    _seconds: number;
    _nanoseconds: number;
  } | string;
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
    const data = Array.isArray(bookings) ? bookings : bookings?.bookings || [];

    if (!data || data.length === 0) return [];

    if (!searchTerm.trim()) return data;

    return data.filter((booking: Booking) => {
      return (
        booking.bookingStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingChannel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.slot?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [bookings, searchTerm]);

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
        <Input
          type="text"
          placeholder="Search patient, doctor, specialty, channel or time slot"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startIcon={<Search className="w-5 h-5 text-gray-400" />}
          fullWidth
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Channel</th>
                  <th>Specialty</th>
                  <th>Status</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                        {booking?.doctorName || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                        {booking?.bookingDate ? (
                          <FormattedDate timestamp={booking.bookingDate} />
                        ) : booking?.date ? (
                          <FormattedDate timestamp={booking.date} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
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
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                        {booking?.bookingChannel || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                        {booking?.specialization || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.bookingStatus || booking.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalCount={filteredBookings.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="bookings"
          />
        </div>
      )}

    </div>
  );
};

export default BookingList;
