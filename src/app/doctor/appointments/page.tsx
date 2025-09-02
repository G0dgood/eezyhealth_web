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

export default function DoctorAppointmentsPage() {
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
    console.log("Adding appointment:", appointmentData);
    // TODO: Implement appointment creation
  };

  const handleConsultationNote = (note: string) => {
    console.log("Adding consultation note:", note);
    // TODO: Implement consultation note addition
  };

  const handleCancelAppointment = (reason: string) => {
    console.log("Canceling appointment:", reason);
    // TODO: Implement appointment cancellation
  };

  // Sample appointment data
  const appointments: DoctorAppointment[] = [
    {
      id: "APT-001",
      patientName: "Seun Simeon",
      date: "24-05-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "pending",
      patientAge: 45,
      temperature: "36°C",
      weight: "55kg",
      bloodPressure: "120/80 mmHg",
      heartRate: "72 bpm",
      reason: "I am feeling sick and i've been weak for some days now",
      consultationNote:
        "Patient reported improvement. Prescribed antibiotics medication for 7 days.",
    },
    {
      id: "APT-002",
      patientName: "Felix Simeon",
      date: "21-05-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "completed",
      patientAge: 32,
      temperature: "37°C",
      weight: "70kg",
      bloodPressure: "125/85 mmHg",
      heartRate: "75 bpm",
      reason: "Regular checkup",
      consultationNote: "Patient is healthy. No medication needed.",
    },
    {
      id: "APT-003",
      patientName: "Kofi Simeon",
      date: "20-05-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "completed",
      patientAge: 28,
      temperature: "36.5°C",
      weight: "65kg",
      bloodPressure: "118/78 mmHg",
      heartRate: "70 bpm",
      reason: "Follow-up consultation",
      consultationNote: "Patient condition stable. Continue current treatment.",
    },
    {
      id: "APT-004",
      patientName: "Fatima Simeon",
      date: "19-05-2024",
      time: "08:30 AM",
      channel: "chat",
      status: "completed",
      patientAge: 35,
      temperature: "36.8°C",
      weight: "58kg",
      bloodPressure: "122/82 mmHg",
      heartRate: "73 bpm",
      reason: "General consultation",
      consultationNote: "Patient advised to maintain healthy lifestyle.",
    },
    {
      id: "APT-005",
      patientName: "Joy Simeon",
      date: "18-05-2024",
      time: "08:30 AM",
      channel: "chat",
      status: "completed",
      patientAge: 29,
      temperature: "37.2°C",
      weight: "62kg",
      bloodPressure: "120/80 mmHg",
      heartRate: "71 bpm",
      reason: "Health checkup",
      consultationNote:
        "Patient is in good health. Annual checkup recommended.",
    },
    {
      id: "APT-006",
      patientName: "Tolu Simeon",
      date: "17-05-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "completed",
      patientAge: 41,
      temperature: "36.9°C",
      weight: "68kg",
      bloodPressure: "125/83 mmHg",
      heartRate: "74 bpm",
      reason: "Follow-up appointment",
      consultationNote: "Treatment progressing well. Continue medication.",
    },
    {
      id: "APT-007",
      patientName: "Tolu Simeon",
      date: "16-05-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "completed",
      patientAge: 41,
      temperature: "36.7°C",
      weight: "68kg",
      bloodPressure: "124/82 mmHg",
      heartRate: "73 bpm",
      reason: "Regular consultation",
      consultationNote: "Patient condition stable. No changes needed.",
    },
    {
      id: "APT-008",
      patientName: "Tolu Simeon",
      date: "01-04-2024",
      time: "08:30 AM",
      channel: "videoCall",
      status: "completed",
      patientAge: 41,
      temperature: "37.1°C",
      weight: "67kg",
      bloodPressure: "126/84 mmHg",
      heartRate: "75 bpm",
      reason: "Health assessment",
      consultationNote:
        "Patient showing improvement. Continue current regimen.",
    },
    {
      id: "APT-009",
      patientName: "Tolu Simeon",
      date: "01-04-2024",
      time: "08:30 AM",
      channel: "chat",
      status: "completed",
      patientAge: 41,
      temperature: "36.8°C",
      weight: "67kg",
      bloodPressure: "125/83 mmHg",
      heartRate: "74 bpm",
      reason: "Follow-up consultation",
      consultationNote: "Patient responding well to treatment.",
    },
    {
      id: "APT-010",
      patientName: "Tolu Simeon",
      date: "01-04-2024",
      time: "08:30 AM",
      channel: "voiceCall",
      status: "cancelled",
      patientAge: 41,
      temperature: "36.9°C",
      weight: "67kg",
      bloodPressure: "125/83 mmHg",
      heartRate: "74 bpm",
      reason: "Emergency consultation",
      consultationNote: "Appointment cancelled by patient.",
    },
  ];

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

  const handleActionMenuToggle = (appointmentId: string) => {
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
    console.log("Rescheduling appointment:", rescheduleData);
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

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PATIENT NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  TIME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  CHANNEL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  APPOINTMENT STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {currentAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-[var(--muted)]">
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
                      onClick={() => handleActionMenuToggle(appointment.id)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenuOpen === appointment.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-md shadow-lg z-10 border border-[var(--border)]">
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
              ))}
            </tbody>
          </table>
        </div>

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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
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

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={closeAllModals}
        onSubmit={handleAddAppointment}
      />

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
