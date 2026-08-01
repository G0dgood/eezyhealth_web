"use client";
import { useState, useEffect } from "react";
import { useGetBookingCancellationsByDoctorIdQuery } from "@/store/bookingCancellationApi";
import { useAuth } from "@/contexts/AuthContext";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCancellationTableSkeleton } from "@/components/ui/BookingCancellationTableSkeleton";
import {
  NoRecordFound,
  getCancellationStatusBadge,
} from "@/components/Options";
import { useApiError } from "@/hooks/useApiError";

interface CancelledAppointment {
  id: string;
  patientName: string;
  patientId?: string;
  userId?: string;
  doctorId: string;
  doctorName?: string;
  bookingDate: any; // Firebase timestamp
  slot: string;
  timeSlot?: string; // fallback
  bookingChannel?: string;
  bookingStatus?: string;
  bookingId?: string;
  cancellationRequest: {
    reasonForCancellation?: string;
    reason?: string; // fallback
    status: string;
    adminResponse?: string;
    respondedAt?: any; // Firebase timestamp
    respondedBy?: string;
  };
  status: string;
  paymentStatus?: string;
  specialization?: string;
  hospital?: string;
  patientAddress?: string;
  doctorPhotoUrl?: string;
  photo_url?: string;
  comments?: any[];
}

export default function DoctorBookingCancellationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current doctor ID
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;

  // Use RTK Query to fetch booking cancellations by doctorId
  const {
    data: cancellationsData,
    isLoading,
    error,
    refetch,
  } = useGetBookingCancellationsByDoctorIdQuery(
    { doctorId: doctorId! },
    { skip: !doctorId }
  );

  const cancelledAppointments =
    (cancellationsData as unknown as CancelledAppointment[]) || [];

  useApiError(!!error, error, "Failed to load cancellation requests");

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Breadcrumb
            homeHref="/doctor"
            items={[
              { label: "Doctor", href: "/doctor" },
              {
                label: "Booking Cancellation",
                href: "/doctor/booking-cancellation",
              },
            ]}
          />
        </div>
        <Title title="Cancelled Appointments" />
        <div className="flex-1 mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <BookingCancellationTableSkeleton rows={5} />
      </div>
    );
  }

  // Filter appointments based on search term
  const filteredAppointments = cancelledAppointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            {
              label: "Booking Cancellation",
              href: "/doctor/booking-cancellation",
            },
          ]}
        />
      </div>

      <Title title="Cancelled Appointments" />
      <div className="flex-1 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search patient..."
        />
      </div>

      {/* Appointments Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th>PATIENT</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>REASON </th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {currentAppointments?.length === 0 ||
                currentAppointments?.length === undefined ? (
                <NoRecordFound colSpan={6} />
              ) : (
                currentAppointments?.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-[var(--muted)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] font-medium text-[var(--foreground)]">
                        {appointment.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                        {appointment.bookingDate?.toDate
                          ? appointment.bookingDate
                            .toDate()
                            .toLocaleDateString()
                          : new Date(
                            appointment.bookingDate
                          ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                        {appointment.slot || appointment.timeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                        {appointment.cancellationRequest
                          ?.reasonForCancellation ||
                          appointment.cancellationRequest?.reason ||
                          "No reason provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${(appointment.bookingStatus as string)?.toLowerCase() === "cancelled"
                          ? "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20"
                          : (appointment.bookingStatus as string)?.toLowerCase() === "approved"
                            ? "bg-green-100 text-green-800"
                            : (appointment.bookingStatus as string)?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          }`}>
                        {(appointment.bookingStatus as string) || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
