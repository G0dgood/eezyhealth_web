"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Activity, FileText } from "lucide-react";
import VitalsModal from "@/components/modals/VitalsModal";
import ConsultationNoteModal from "@/components/modals/ConsultationNoteModal";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumb from "@/components/Breadcrumb";
import PillTabs from "@/components/Tabs/PillTabs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGetPatientAppointmentsQuery } from "@/store/patientApi";
import { convertSlotToTime } from "@/components/Options";
import { formatFirebaseDate } from "@/utils/dateUtils";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { NoRecordFound } from "@/components/Options";
import Pagination from "@/components/Pagination";
import { useApiError } from "@/hooks/useApiError";

export default function AdminPatientAppointmentsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId") || "";
  const patientName = searchParams.get("patient") || "Patient";

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(undefined);
  const [selectedBookingDate, setSelectedBookingDate] = useState<any>(undefined);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useGetPatientAppointmentsQuery(patientId, {
    skip: !patientId,
  });

  useApiError(!!error, error, "Failed to load patient appointments");

  // Transform data
  const appointments = useMemo(() => {
    if (!bookingsData) return [];
    return bookingsData.map((booking: any) => {
      let status = "Upcoming";
      if (booking.bookingStatus === "Completed") status = "Completed";
      else if (booking.bookingStatus === "Cancelled") status = "Cancelled";
      else if (booking.bookingStatus === "Accepted") status = "Upcoming";

      const time = convertSlotToTime(booking.slot || "");
      const period = booking.slot?.includes("morning")
        ? "Morning"
        : booking.slot?.includes("afternoon")
          ? "Afternoon"
          : booking.slot?.includes("evening")
            ? "Evening"
            : "Afternoon";

      const formattedDate = booking?.bookingDate
        ? formatFirebaseDate(booking?.bookingDate)
        : "Date not available";

      return {
        id: booking?.bookingId || booking?.id,
        image:
          booking?.doctorPhotoUrl ||
          booking?.doctorPhoto ||
          "",
        doctor: booking?.doctorName || "Unknown Doctor",
        specialty: booking?.specialization || "General",
        bookingId: booking?.bookingId || booking?.id,
        date: formattedDate,
        hospital: booking?.hospital || "Hospital not specified",
        time,
        period,
        status,
        channel: booking?.bookingChannel || booking?.channel || "N/A",
        consultationNote: booking?.consultationNote || booking?.doctorComment,
        doctorRecommendation: booking?.doctorRecommendation,
        diagnosis: booking?.diagnosis,
        prescriptions: booking?.prescriptions,
        bookingData: booking,
      };
    });
  }, [bookingsData]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (activeTab === "upcoming") {
        return appointment.status === "Upcoming";
      } else if (activeTab === "completed") {
        return appointment.status === "Completed";
      } else {
        return appointment.status === "Cancelled";
      }
    });
  }, [appointments, activeTab]);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(startIndex, startIndex + pageSize);
  }, [filteredAppointments, currentPage]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <TableSkeleton columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-[16px] md:text-[18px] font-semibold text-red-600 mb-2">Error Loading Appointments</h2>
        <p className="text-gray-600 mb-4">Failed to fetch patient appointments.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Patients", href: "/admin/users/patients" },
          { label: "Appointments" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/users/patients"
            className="text-gray-600 hover:text-gray-800 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900">{patientName}</h1>
        </div>

        {/* Tabs */}
        <PillTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>

      {/* Appointments Table */}
      <div className="table-container bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Booking Info</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments?.length === 0 ? (
                <NoRecordFound colSpan={5} />
              ) : (
                paginatedAppointments?.map((appointment) => (
                  <tr key={appointment?.id} className="table-row-hover">
                    {/* Doctor Column */}
                    <td>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {appointment.image ? (
                            <img
                              src={appointment.image}
                              alt={appointment.doctor}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="avatar-green h-10 w-10 rounded-full flex items-center justify-center">
                              <span className=" !text-[10px]  !md:text-[12px] font-medium">
                                {appointment.doctor.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className=" !text-[10px]  !md:text-[12px] font-medium text-gray-900">
                            {appointment.doctor}
                          </div>
                          <div className=" !text-[10px]  !md:text-[12px] text-gray-500">
                            {appointment.specialty}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Booking Info Column */}
                    <td>
                      <div className=" !text-[10px]  !md:text-[12px] text-gray-900">
                        ID: {appointment.bookingId ? `${appointment.bookingId.slice(0, 8)}...` : "N/A"}
                      </div>
                      <div className=" !text-[10px]  !md:text-[12px] text-gray-500">
                        {appointment.channel}
                      </div>
                    </td>

                    {/* Schedule Column */}
                    <td>
                      <div className=" !text-[10px]  !md:text-[12px] text-gray-900">
                        {appointment.date}
                      </div>
                      <div className=" !text-[10px]  !md:text-[12px] text-gray-500">
                        {appointment.time} ({appointment.period})
                      </div>
                    </td>

                    {/* Status Column */}
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>

                    {/* Actions Column */}
                    <td>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedBookingId(appointment.bookingId);
                            setSelectedBookingDate(appointment.bookingData?.bookingDate);
                            setIsVitalsModalOpen(true);
                          }}
                          className="link-green flex items-center space-x-1"
                        >
                          <Activity className="w-4 h-4" />
                          <span>Vitals</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsConsultationModalOpen(true);
                          }}
                          className="link-green flex items-center space-x-1"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Consultation Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalCount={filteredAppointments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemLabel="appointments"
          className="border-t border-gray-200"
        />
      </div>


      {/* Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => {
          setIsVitalsModalOpen(false);
          setSelectedBookingId(undefined);
        }}
        patientId={patientId}
        bookingId={selectedBookingId}
        patientName={patientName}
      />

      {/* Consultation Details Modal */}
      <ConsultationNoteModal
        isOpen={isConsultationModalOpen}
        onClose={() => {
          setIsConsultationModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={() => { }} // No-op for read-only
        initialData={{
          note: selectedAppointment?.consultationNote,
          recommendation: selectedAppointment?.doctorRecommendation,
          diagnosis: selectedAppointment?.diagnosis,
          prescriptions: selectedAppointment?.prescriptions,
        }}
        readOnly={true}
      />
    </div>
  );
}
