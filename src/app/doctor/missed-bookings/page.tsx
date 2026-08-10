"use client";

import { useState, useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import StatusBadge from "@/components/StatusBadge";
import { useApiError } from "@/hooks/useApiError";
import { useGetBookingsQuery } from "@/store/bookingApi";
import { useAuth } from "@/contexts/AuthContext";
import FormattedDate from "@/utils/FormattedDate";
import { isMissedBooking, parseBookingMillis } from "@/utils/missedBookings";

export default function DoctorMissedBookingsPage() {
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : "";

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all bookings without pagination argument to perform precise client-side status filtering
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});

  useApiError(!!error, error, "Failed to load missed bookings. Please try again.");

  // Filter for missed bookings scoped to this doctor, then apply search query
  const filteredMissedBookings = useMemo(() => {
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];

    // Only this doctor's bookings that are missed (past date + never settled).
    let missed = bookings.filter(
      (b: any) =>
        (!doctorId || b.doctorId === doctorId) && isMissedBooking(b)
    );

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
  }, [bookingsData, searchQuery, doctorId]);

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
            items={[{ label: "Doctor", href: "/doctor" }, { label: "Missed Bookings" }]}
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
            columns={6}
            rows={5}
            headerLabels={[
              "Patient Name",
              "Date",
              "Time",
              "Channel",
              "Specialty",
              "Status",
            ]}
          />
        ) : (
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th> Patient Name </th>
                    <th> Date </th>
                    <th> Time </th>
                    <th> Channel </th>
                    <th> Specialty </th>
                    <th> Status </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                  {paginatedBookings.length === 0 ? (
                    <NoRecordFound colSpan={6} />
                  ) : (
                    paginatedBookings.map((booking: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-[var(--muted)] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-medium">
                            {booking.patientName || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-[var(--muted-foreground)]">
                          {booking.bookingDate ? (
                            <FormattedDate timestamp={booking.bookingDate} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-[var(--foreground)]">
                          {booking.slot ? (
                            <span className="capitalize">
                              {booking.slot.replace(/_/g, " ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-[var(--foreground)] capitalize">
                          {booking.bookingChannel || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-[var(--foreground)]">
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
