"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Video, MessageCircle, Phone } from "lucide-react";
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
import { showError, showSuccess, showInfo } from "@/utils/toast";
import { convertSlotToTime } from "@/components/Options";
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
  } = useBookingsByDoctorId(doctorId);

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
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("bottom");

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

  const handleConsultationNote = (note: string) => {
    // TODO: Implement consultation note addition
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
      // Handle Firestore timestamp conversion
      let appointmentDate: string;
      if (
        booking.bookingDate &&
        typeof booking.bookingDate === "object" &&
        booking.bookingDate !== null
      ) {
        const timestamp = booking.bookingDate as {
          seconds: number;
          nanoseconds: number;
        };
        const date = new Date(timestamp.seconds * 1000);
        appointmentDate = date.toLocaleDateString("en-GB"); // DD-MM-YYYY format
      } else {
        appointmentDate = String(booking.bookingDate || booking.date || "");
      }

      return {
        id: String(booking.id || booking.bookingId || booking.documentId || booking.uid || `booking-${index}`),
        patientName: String(booking.patientName || "Unknown Patient"),
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
        consultationNote: String(booking.consultationNote || ""),
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

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusClasses = {
      pending: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  const handleActionMenuToggle = (
    appointmentId: string,
    event: React.MouseEvent
  ) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const menuHeight = 200; // Approximate height of the menu

    // Find the table container to determine table boundaries
    const tableContainer = button.closest("table")?.parentElement;
    const tableRect = tableContainer?.getBoundingClientRect();

    // Check if there's enough space below within the table
    const spaceBelowInTable = tableRect
      ? tableRect.bottom - rect.bottom
      : viewportHeight - rect.bottom;
    const spaceBelowInViewport = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Face up if close to end of table OR close to bottom of viewport
    if (
      (spaceBelowInTable < menuHeight && spaceAbove > menuHeight) ||
      (spaceBelowInViewport < menuHeight && spaceAbove > menuHeight)
    ) {
      setMenuPosition("top");
    } else {
      setMenuPosition("bottom");
    }

    setActionMenuOpen(actionMenuOpen === appointmentId ? null : appointmentId);
  };

  const handleViewDetails = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleViewNote = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsConsultationNoteModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleReschedule = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setIsRescheduleModalOpen(true);
    setActionMenuOpen(null);
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
    setActionMenuOpen(null);
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
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
                {currentAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  currentAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-[var(--muted)]">
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
                        <button
                          onClick={(e) =>
                            handleActionMenuToggle(appointment.id, e)
                          }
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuOpen === appointment.id && (
                          <div
                            className={`absolute right-0 w-48 bg-[var(--card)] rounded-md shadow-lg z-9999 border border-[var(--border)] ${menuPosition === "top"
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                              }`}>
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(appointment)}
                                className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer">
                                View Details
                              </button>
                              {appointment.status === "completed" && (
                                <button
                                  onClick={() => handleViewNote(appointment)}
                                  className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer">
                                  View Note
                                </button>
                              )}
                              {appointment.status === "pending" && (
                                <button
                                  onClick={() => handleReschedule(appointment)}
                                  className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer">
                                  Reschedule Appointment
                                </button>
                              )}
                              {appointment.status === "pending" && (
                                <button
                                  onClick={() => handleCancel(appointment)}
                                  className="block w-full text-left px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer">
                                  Cancel Appointment
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[var(--card)] px-4 py-3 flex items-center justify-between border-t border-[var(--border)] sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                          ? "z-10 bg-[#44CE2D] border-[#44CE2D] text-white"
                          : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                          }`}>
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
        initialNote={selectedAppointment?.consultationNote || ""}
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
