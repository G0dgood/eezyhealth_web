"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Video, MessageCircle, Phone, FileText, Eye, X, User, Calendar } from "lucide-react";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import {
  DoctorAppointment,
  AppointmentStatus,
  AppointmentChannel,
} from "@/types";
import {
  AddAppointmentModal,
  AppointmentDetailModal,
  ConsultationNoteModal,
  RescheduleModal,
  CancelAppointmentModal,
} from "@/components/modals";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import { useUpdateBookingStatusMutation } from "@/store/bookingApi";
import { showError, showSuccess, showInfo } from "@/utils/toast";
import { convertSlotToTime, NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;

  // Fetch appointments using RTK Query
  const {
    data: bookingsData,
    isLoading,
    error,
    refetch,
  } = useBookingsByDoctorId(doctorId);

  const [updateBookingStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBookingStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConsultationNoteModalOpen, setIsConsultationNoteModalOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DoctorAppointment | null>(null);

  // Prevent body scrolling when modals are open
  useEffect(() => {
    if (
      isDetailModalOpen ||
      isAddModalOpen ||
      isRescheduleModalOpen ||
      isCancelModalOpen ||
      isConsultationNoteModalOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    isDetailModalOpen,
    isAddModalOpen,
    isRescheduleModalOpen,
    isCancelModalOpen,
    isConsultationNoteModalOpen,
  ]);

  // Handler functions for modals
  const handleAddAppointment = (appointmentData: {
    patientName: string;
    date: string;
    time: string;
    reason: string;
  }) => {
    // TODO: Implement appointment creation
  };

  const handleConsultationNote = async (data: {
    note: string;
    recommendation: string;
    diagnosis: string;
    prescriptions: string;
  }) => {
    if (!selectedAppointment?.id) return;

    try {
      const prescriptionsArray = data.prescriptions
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      await updateBookingStatus({
        bookingId: selectedAppointment.id,
        newStatus: selectedAppointment.status,
        comment: data.note,
        recommendation: data.recommendation,
        diagnosis: data.diagnosis,
        prescriptions: prescriptionsArray,
      }).unwrap();

      await refetch();
      showSuccess("Success", "Consultation details saved successfully!");
      closeAllModals();
    } catch (error) {
      console.error("Failed to save details:", error);
      showError("Error", "Failed to save consultation details.");
    }
  };

  const handleCancelAppointment = (reason: string) => {
    // TODO: Implement appointment cancellation
  };

  // Transform API data to appointments
  const transformBookingsToAppointments = (
    bookings: Record<string, unknown>[]
  ): DoctorAppointment[] => {
    if (!bookings || bookings.length === 0) return [];

    return bookings.map((booking, index) => {
      // Debug: Log booking structure to understand the ID field
      if (index === 0) {
      }
      // Handle Firestore timestamp conversion and string dates
      let appointmentDate: string = "";
      const rawDate = booking.bookingDate || booking.date;

      if (rawDate) {
        if (typeof rawDate === "object" && rawDate !== null) {
          const seconds = (rawDate as any).seconds || (rawDate as any)._seconds;
          if (typeof seconds === "number") {
            const date = new Date(seconds * 1000);
            appointmentDate = date.toLocaleDateString("en-GB"); // DD-MM-YYYY format
          }
        } else if (typeof rawDate === "string") {
          const date = new Date(rawDate);
          if (!isNaN(date.getTime())) {
            appointmentDate = date.toLocaleDateString("en-GB");
          } else {
            appointmentDate = rawDate;
          }
        }
      }

      return {
        id: String(
          booking.id ||
          booking.bookingId ||
          booking.documentId ||
          booking.uid ||
          `booking-${index}`
        ),
        patientName: String(booking.patientName || "Unknown Patient"),
        patientId: String(booking.patientId || booking.userId || ""),
        date: appointmentDate,
        time: convertSlotToTime(String(booking.slot || "")),
        channel: (() => {
          const channel = String(booking.bookingChannel || "");
          if (channel === "1" || channel === "videoCall") return "videoCall";
          if (channel === "2" || channel === "chat") return "chat";
          if (channel === "3" || channel === "voiceCall") return "voiceCall";
          if (channel === "4" || channel === "physical") return "videoCall"; // Default to videoCall for physical
          return "videoCall";
        })(),
        status: (() => {
          const status = String(booking.bookingStatus || "").toLowerCase();
          if (status === "accepted" || status === "confirmed")
            return "completed";
          if (status === "pending") return "pending";
          if (status === "cancelled") return "cancelled";
          return "pending";
        })(),
        patientAge: Number(booking.patientAge) || 0,
        temperature: "36°C", // Default values since these aren't in booking data
        weight: "65kg",
        bloodPressure: "120/80 mmHg",
        heartRate: "72 bpm",
        reason: String(booking.reason || "No reason provided"),
        consultationNote: String(
          booking.consultationNote || booking.doctorComment || ""
        ),
        doctorRecommendation: String(booking.doctorRecommendation || ""),
        diagnosis: String(booking.diagnosis || ""),
        prescriptions: Array.isArray(booking.prescriptions)
          ? (booking.prescriptions as string[])
          : [],
      };
    });
  };

  const appointments: DoctorAppointment[] = transformBookingsToAppointments(
    bookingsData || []
  );

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const statusDisplayMap: Record<AppointmentStatus, string> = {
    pending: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled:
        "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${statusClasses[status]}`}
      >
        {statusDisplayMap[status]}
      </span>
    );
  };

  const getChannelIcon = (channel: AppointmentChannel) => {
    const iconClasses = "w-4 h-4";
    switch (channel) {
      case "videoCall":
        return <Video className={`${iconClasses} text-blue-600`} />;
      case "chat":
        return <MessageCircle className={`${iconClasses} text-green-600`} />;
      case "voiceCall":
        return <Phone className={`${iconClasses} text-purple-600`} />;
      default:
        return <Video className={`${iconClasses} text-gray-600`} />;
    }
  };

  const handleViewDetails = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleViewNote = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsConsultationNoteModalOpen(true);
  };

  const handleReschedule = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (rescheduleData: {
    date: string;
    time: string;
  }) => {
    // TODO: Implement appointment rescheduling
  };

  const handleCancel = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setIsRescheduleModalOpen(false);
    setIsCancelModalOpen(false);
    setIsConsultationNoteModalOpen(false);
    setSelectedAppointment(null);
  };

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showError(
        "Appointment Error",
        "Failed to load appointments. Please try again."
      );
    }
  }, [error]);

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Appointments", href: "/doctor/appointments" },
          ]}
        />
      </div>

      <Title title="Appointment" />

      {/* Search and Add Appointment */}
      <div className="flex-1 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search..."
        />
      </div>

      {/* Appointments Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th>PATIENT NAME</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>CHANNEL</th>
                  <th>APPOINTMENT STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {currentAppointments?.length === 0 ? (
                  <NoRecordFound colSpan={6} />
                ) : (
                  currentAppointments?.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-[var(--muted)]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {appointment.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">
                          {appointment.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getChannelIcon(appointment.channel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div className="flex items-center space-x-6">
                          <Link
                            href={`/doctor/patients/appointments?patient=${encodeURIComponent(
                              appointment.patientName
                            )}&patientId=${appointment.patientId || ""}`}
                            className="link-green flex items-center space-x-1"
                          >
                            <User className="w-4 h-4" />
                            <span>Appointments</span>
                          </Link>
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="link-green flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleViewNote(appointment)}
                            className="link-green flex items-center space-x-1"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Consultation Details</span>
                          </button>
                          {appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleReschedule(appointment)}
                                className="text-orange-600 hover:text-orange-800 transition-colors"
                                title="Reschedule Appointment"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(appointment)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Cancel Appointment"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalCount={filteredAppointments.length}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="appointments"
        />
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeAllModals}
        appointment={selectedAppointment}
      />

      {/* Consultation Note Modal */}
      <ConsultationNoteModal
        isOpen={isConsultationNoteModalOpen}
        onClose={closeAllModals}
        onSubmit={handleConsultationNote}
        initialData={{
          note: selectedAppointment?.consultationNote,
          recommendation: selectedAppointment?.doctorRecommendation,
          diagnosis: selectedAppointment?.diagnosis,
          prescriptions: selectedAppointment?.prescriptions,
        }}
        isSubmitting={isUpdatingStatus}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={closeAllModals}
        onSubmit={handleRescheduleSubmit}
        currentDate={selectedAppointment?.date || ""}
        currentTime={selectedAppointment?.time || ""}
      />

      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={closeAllModals}
        onConfirm={handleCancelAppointment}
        appointmentDetails={
          selectedAppointment
            ? {
              patientName: selectedAppointment.patientName,
              date: selectedAppointment.date,
              time: selectedAppointment.time,
            }
            : undefined
        }
      />
    </div>
  );
}
