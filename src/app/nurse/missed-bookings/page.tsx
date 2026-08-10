"use client";

import { useState, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import StatusBadge from "@/components/StatusBadge";
import { useApiError } from "@/hooks/useApiError";
import { useGetBookingsQuery } from "@/store/bookingApi";
import FormattedDate from "@/utils/FormattedDate";
import { isMissedBooking, parseBookingMillis } from "@/utils/missedBookings";

export default function NurseMissedBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all bookings without pagination argument to perform precise client-side status filtering
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});

  useApiError(!!error, error, "Failed to load missed bookings. Please try again.");

  // Filter for missed bookings and apply search query
  const filteredMissedBookings = useMemo(() => {
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    
    // Filter by missed status (computed: past date + never settled).
    let missed = bookings.filter((b: any) => isMissedBooking(b));

    // Apply search filter if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      missed = missed.filter((b: any) =>
        b.patientName?.toLowerCase().includes(query) ||
        b.doctorName?.toLowerCase().includes(query) ||
        b.specialization?.toLowerCase().includes(query) ||
        b.bookingChannel?.toLowerCase().includes(query)
      );
    }

    // Sort by bookingDate descending
    return missed.sort((a: any, b: any) => {
      return parseBookingMillis(b.bookingDate) - parseBookingMillis(a.bookingDate);
    });
  }, [bookingsData, searchQuery]);

  // Paginate filtered results
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMissedBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMissedBookings, currentPage, itemsPerPage]);

  const totalCount = filteredMissedBookings.length;

  return (
    <div>
      <div className="flex-1">
        <div className="mb-6">
          <Breadcrumb
            items={[{ label: "Nurse", href: "/nurse" }, { label: "Missed Bookings" }]}
          />
        </div>
        <Title title="Missed Bookings" />

        {/* Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search missed bookings..."
            />
          </div>
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
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th> Patient Name </th>
                    <th> Doctor </th>
                    <th> Date </th>
                    <th> Time </th>
                    <th> Channel </th>
                    <th> Specialty </th>
                    <th> Status </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBookings.length === 0 ? (
                    <NoRecordFound colSpan={7} />
                  ) : (
                    paginatedBookings.map((booking: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-medium">
                            {booking.patientName || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
                          {booking.doctorName || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
                          {booking.bookingDate ? (
                            <FormattedDate timestamp={booking.bookingDate} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
                          {booking.slot ? (
                            <span className="capitalize">
                              {booking.slot.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900 capitalize">
                          {booking.bookingChannel || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-900">
                          {booking.specialization || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status="Missed" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalCount > 0 && (
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
