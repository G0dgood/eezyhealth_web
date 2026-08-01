"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import Input from "@/components/Input";
import Title from "@/components/Title";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useGetBookingsQuery } from "@/store/bookingApi";
import FormattedDate from "@/utils/FormattedDate";
import Pagination from "@/components/Pagination";
import { useApiError } from "@/hooks/useApiError";

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

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
  });

  const paginatedBookings = useMemo(() => {
    return (bookings || []) as Booking[];
  }, [bookings]);

  const totalCount = (bookings as any)?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useApiError(!!error, error, "Failed to load bookings. Please try again.");

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <Title title="Booking List" />
      
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
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${booking.bookingStatus === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : (booking.bookingStatus === "pending" || booking.bookingStatus === "Pending" || booking.status === "Pending")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                          {booking.bookingStatus || "-"}
                        </span>
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
            totalCount={totalCount}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            itemLabel="bookings"
          />
        </div>
      )}
    </div>
  );
}
