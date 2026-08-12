"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, MessageCircle, Phone, FileText, Eye, X, User, Calendar, CheckCircle } from "lucide-react";
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
  AppointmentDetailModal,
  ConsultationNoteModal,
  RescheduleModal,
  CancelAppointmentModal,
  Modal,
} from "@/components/modals";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import { useUpdateBookingStatusMutation } from "@/store/bookingApi";
import { showError, showSuccess, showInfo } from "@/utils/toast";
import { useApiError } from "@/hooks/useApiError";
import { convertSlotToTime, NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import PaidPendingBookingsSection from "@/components/PaidPendingBookingsSection";

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DoctorAppointment | null>(null);

  // Prevent body scrolling when modals are open
  useEffect(() => {
    if (
      isDetailModalOpen ||
      isAddModalOpen ||
      isRescheduleModalOpen ||
      isCancelModalOpen ||
      isConsultationNoteModalOpen ||
      isConfirmModalOpen
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
    isConfirmModalOpen,
  ]);



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

  const handleCancelAppointment = async (reason: string) => {
    if (!selectedAppointment?.id) return;
    try {
      await updateBookingStatus({
        bookingId: selectedAppointment.id,
        newStatus: "Cancelled",
        cancellationReason: reason || "Cancelled by doctor",
        actor: "doctor",
      }).unwrap();

      await refetch();
      showSuccess(
        "Appointment Cancelled",
        `${selectedAppointment.patientName}'s appointment has been cancelled.`
      );
      closeAllModals();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      showError("Error", "Failed to cancel the appointment. Please try again.");
    }
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
          // bookingChannel is stored inconsistently: legacy numeric codes
          // ("1".."4"), camelCase ("videoCall"), and human labels ("Video",
          // "Voice", "Voice Call", "Chat", "Physical"). Normalize case and match
          // by substring so every real value maps to the right icon.
          const raw = String(booking.bookingChannel || "").toLowerCase();
          if (raw === "2" || raw.includes("chat")) return "chat";
          if (
            raw === "3" ||
            raw.includes("voice") ||
            raw.includes("audio") ||
            raw.includes("phone")
          )
            return "voiceCall";
          if (
            raw === "4" ||
            raw.includes("physical") ||
            raw.includes("person") ||
            raw.includes("hospital") ||
            raw.includes("in-person")
          )
            return "physical";
          if (
            raw === "1" ||
            raw.includes("video")
          )
            return "videoCall";
          return "videoCall";
        })(),
        status: (() => {
          const status = String(booking.bookingStatus || booking.status || "").toLowerCase();
          if (status === "accepted" || status === "confirmed")
            return "confirmed";
          if (status === "rescheduled") return "rescheduled";
          if (status === "completed") return "completed";
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

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const statusDisplayMap: Record<AppointmentStatus, string> = {
    pending: "Scheduled",
    confirmed: "Confirmed",
    rescheduled: "Rescheduled (Action Required)",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
      rescheduled: "bg-orange-100 text-orange-800 border border-orange-300 font-semibold",
      completed: "bg-green-100 text-green-800 border border-green-300",
      cancelled:
        "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          statusClasses[status] || statusClasses.pending
        }`}
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
      case "physical":
        return <User className={`${iconClasses} text-amber-600`} />;
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

  const handleRescheduleSubmit = async (rescheduleData: {
    date: string;
    time: string;
  }) => {
    if (!selectedAppointment?.id) return;
    try {
      // Bookings store bookingDate as "DD-MMM-YY" (e.g. "04-Aug-26"); the modal
      // emits "YYYY-MM-DD". Convert so the rescheduled date matches the format
      // the rest of the app reads.
      const MONTHS = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const d = new Date(rescheduleData.date);
      const newBookingDate = isNaN(d.getTime())
        ? rescheduleData.date
        : `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${String(
            d.getFullYear()
          ).slice(-2)}`;

      await updateBookingStatus({
        bookingId: selectedAppointment.id,
        newStatus: "Rescheduled",
        newBookingDate,
        newSlot: rescheduleData.time,
        actor: "doctor",
      }).unwrap();

      await refetch();
      showSuccess(
        "Appointment Rescheduled",
        `${selectedAppointment.patientName}'s appointment has been rescheduled.`
      );
      closeAllModals();
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      showError("Error", "Failed to reschedule the appointment. Please try again.");
    }
  };

  const handleCancel = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsCancelModalOpen(true);
  };

  const handleConfirmClick = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment?.id) return;

    try {
      // Setting the status to "Accepted" triggers the onBookingUpdated Cloud
      // Function, which sends the patient an "Appointment Confirmed" in-app
      // notification + push notification automatically.
      await updateBookingStatus({
        bookingId: selectedAppointment.id,
        newStatus: "Accepted",
      }).unwrap();

      await refetch();
      showSuccess(
        "Appointment Confirmed",
        `${selectedAppointment.patientName} has been notified that their appointment is confirmed.`
      );
      closeAllModals();
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      showError("Error", "Failed to confirm the appointment. Please try again.");
    }
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsDetailModalOpen(false);
    setIsRescheduleModalOpen(false);
    setIsCancelModalOpen(false);
    setIsConsultationNoteModalOpen(false);
    setIsConfirmModalOpen(false);
    setSelectedAppointment(null);
  };

  useApiError(!!error, error, "Failed to load appointments. Please try again.");

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

      <PaidPendingBookingsSection doctorId={doctorId} />

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
                        <div className="text-[10px] md:text-[12px] font-medium text-[var(--foreground)]">
                          {appointment.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-[var(--foreground)]">
                          {appointment.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-[var(--foreground)]">
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
                          {(appointment.status === "pending" || appointment.status === "rescheduled") && (
                            <button
                              onClick={() => handleConfirmClick(appointment)}
                              className="flex items-center space-x-1 text-[var(--primary)] hover:opacity-80 transition-opacity font-medium"
                              title="Confirm Appointment"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Confirm</span>
                            </button>
                          )}
                          {(appointment.status === "pending" || appointment.status === "confirmed" || appointment.status === "rescheduled") && (
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
          onPageSizeChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
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
        doctorId={doctorId || ""}
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

      {/* Confirm Appointment Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={closeAllModals}
        title="Confirm Appointment"
        size="md"
      >
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <p className="text-[13px] md:text-[14px] text-gray-600">
              Review the details below and confirm this appointment. The patient
              will be notified instantly.
            </p>
          </div>

          <div className="rounded-lg border border-gray-100 divide-y divide-gray-100 bg-gray-50/60">
            {[
              { label: "Patient", value: selectedAppointment?.patientName },
              { label: "Date", value: selectedAppointment?.date },
              { label: "Time", value: selectedAppointment?.time },
              {
                label: "Channel",
                value:
                  selectedAppointment?.channel === "videoCall"
                    ? "Video Consultation"
                    : selectedAppointment?.channel === "chat"
                      ? "Chat Consultation"
                      : selectedAppointment?.channel === "voiceCall"
                        ? "Voice Call"
                        : selectedAppointment?.channel,
              },
              {
                label: "Reason",
                value: selectedAppointment?.reason,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <span className="text-[12px] text-gray-500">{row.label}</span>
                <span className="text-[12px] md:text-[13px] font-medium text-gray-900 text-right">
                  {row.value || "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={closeAllModals}
              disabled={isUpdatingStatus}
              className="px-4 py-2 text-[13px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={isUpdatingStatus}
              className="px-4 py-2 text-[13px] rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
            >
              {isUpdatingStatus ? (
                "Confirming..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Appointment
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
