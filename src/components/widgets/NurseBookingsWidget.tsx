"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Stethoscope,
} from "lucide-react";
import { useGetBookingsQuery } from "@/store/bookingApi";
import {
  convertBookingsToStandardFormat,
  StandardBookingData,
} from "@/utils/bookingDataConverter";
import AddVitalsModal from "@/components/modals/AddVitalsModal";

interface BookingData {
  id: string;
  patient_name?: string;
  doctor_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  status: string;
  createdTime?: string;
  reason?: string;
  vital_signs?: any;
}

const NurseBookingsWidget: React.FC = () => {
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");

  const standardizedBookings = useMemo(() => {
    const rawBookings = Array.isArray(bookingsData?.bookings)
      ? bookingsData.bookings
      : Array.isArray(bookingsData)
        ? bookingsData
        : bookingsData && typeof bookingsData === "object" && Array.isArray((bookingsData as Record<string, unknown>).data)
          ? (bookingsData as { data: StandardBookingData[] }).data
          : [];

    try {
      return convertBookingsToStandardFormat(
        rawBookings as unknown as Parameters<typeof convertBookingsToStandardFormat>[0]
      );
    } catch {
      return [];
    }
  }, [bookingsData]);

  const slotToTime = (slot: string): string => {
    if (!slot) return "N/A";
    const slotLower = slot.toLowerCase();
    const match = slotLower.match(/(\d{1,2})(?:[:.]?(\d{2}))?(am|pm)/);
    if (!match) return slot.replace(/_/g, " ");
    const hour = parseInt(match[1], 10);
    const minutes = match[2] ? match[2] : "00";
    const period = match[3]?.toUpperCase() ?? "AM";
    return `${hour.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  const parseBookingDate = (
    bookingDate:
      | { _seconds?: number; seconds?: number; toDate?: () => Date }
      | string
      | undefined
  ) => {
    if (!bookingDate) return null;
    if (typeof bookingDate === "string") {
      const parsed = new Date(bookingDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof bookingDate === "object") {
      if (typeof bookingDate._seconds === "number") {
        return new Date(bookingDate._seconds * 1000);
      }
      if (typeof bookingDate.seconds === "number") {
        return new Date(bookingDate.seconds * 1000);
      }
      if (typeof bookingDate.toDate === "function") {
        return bookingDate.toDate();
      }
    }
    return null;
  };

  const slotToDateTime = (date: Date | null, slot: string) => {
    if (!date) return null;
    const slotLower = slot?.toLowerCase?.() ?? "";
    const match = slotLower.match(/(\d{1,2})(?:[:.]?(\d{2}))?(am|pm)/);
    const appointmentDate = new Date(date);
    if (!match) {
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate;
    }
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3];
    if (period === "pm" && hours !== 12) {
      hours += 12;
    }
    if (period === "am" && hours === 12) {
      hours = 0;
    }
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate;
  };

  const upcomingAppointments = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return standardizedBookings
      .map((booking) => {
        const appointmentDate = parseBookingDate(
          booking.bookingDate as unknown as
          | { _seconds?: number; seconds?: number }
          | string
        );
        const appointmentDateTime = slotToDateTime(
          appointmentDate,
          booking.slot
        );
        if (!appointmentDate || !appointmentDateTime) {
          return null;
        }
        const raw = booking as unknown as BookingData &
          StandardBookingData & {
            vital_signs?: unknown;
            reason?: string;
          };
        const derivedReason =
          typeof raw.reason === "string"
            ? raw.reason
            : typeof booking.comments?.[0] === "string"
              ? (booking.comments?.[0] as string)
              : undefined;
        const hasVitals = Boolean(raw.vital_signs);
        return {
          id: booking.bookingId,
          patientId: booking.userId,
          patientName: booking.patientName,
          doctorName: booking.doctorName,
          appointmentTime: slotToTime(booking.slot),
          appointmentDate,
          appointmentDateTime,
          status: booking.bookingStatus?.toLowerCase?.() ?? "pending",
          hasVitals,
          vitalSigns: raw.vital_signs as any,
          reason: derivedReason ?? "",
        };
      })
      .filter(
        (
          booking
        ): booking is {
          id: string;
          patientId: string;
          patientName: string;
          doctorName: string;
          appointmentTime: string;
          appointmentDate: Date;
          appointmentDateTime: Date;
          status: string;
          hasVitals: boolean;
          vitalSigns: any;
          reason: string;
        } => Boolean(booking && booking.appointmentDateTime)
      )
      .filter((booking) => booking.appointmentDateTime >= todayStart)
      .sort(
        (a, b) => a.appointmentDateTime.getTime() - b.appointmentDateTime.getTime()
      );
  }, [standardizedBookings]);

  const displayAppointments = upcomingAppointments.slice(0, 5);

  const totalUpcoming = upcomingAppointments.length;
  const pendingVitals = upcomingAppointments.filter(
    (booking) => !booking.hasVitals
  ).length;
  const completedVitals = upcomingAppointments.filter(
    (booking) => booking.hasVitals
  ).length;
  const urgentCases = upcomingAppointments.filter(
    (booking) =>
      booking.reason &&
      (booking.reason.toLowerCase().includes("urgent") ||
        booking.reason.toLowerCase().includes("emergency"))
  ).length;

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusColor = (status: string, hasVitals: boolean) => {
    if (hasVitals) return "bg-green-100 text-green-800";
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (reason: string | undefined) => {
    if (reason?.toLowerCase().includes("urgent") || reason?.toLowerCase().includes("emergency")) {
      return <AlertCircle size={14} className="text-red-600" />;
    }
    return <Clock size={14} className="text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Error loading appointments. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (displayAppointments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
            No Upcoming Appointments
          </h3>
          <p className="text-[10px] md:text-[12px] text-gray-500 text-center mb-4">
            No appointments scheduled yet. Check back later for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Upcoming Appointments</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">Next patient care schedule</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-blue-600">{totalUpcoming}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Total Upcoming</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-green-600">{completedVitals}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Vitals Done</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-yellow-600">{pendingVitals}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Pending Vitals</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-red-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-red-600">{urgentCases}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Urgent Cases</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3 md:space-y-4">
        {displayAppointments.map((appointment, index: number) => (
          <div
            key={appointment.id || `appointment-${index}`}
            className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 md:mb-3 gap-2">
              <div className="flex items-center gap-2 md:gap-3 overflow-hidden w-full sm:w-auto">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-[10px] md:text-[12px] md:text-base text-gray-900 truncate">
                    {appointment.patientName || "Unknown Patient"}
                  </h4>
                  <p className="text-[10px] md:text-[12px] text-gray-600 truncate">
                    {appointment.doctorName || "Unknown Doctor"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto ml-10 sm:ml-0">
                <span
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getStatusColor(
                    appointment.status,
                    appointment.hasVitals
                  )}`}>
                  {appointment.hasVitals
                    ? "Vitals Done"
                    : "Pending Vitals"}
                </span>
                {getPriorityIcon(
                  appointment.reason
                )}
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              {appointment.appointmentTime ? (
                <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                  <span className="text-xs">🕐</span>
                  <span>
                    {formatTime(
                      appointment.appointmentTime
                    )}
                  </span>
                </div>
              ) : null}
              {appointment.reason && (
                <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                  <span className="text-xs">📋</span>
                  <span>
                    {appointment.reason || "Consultation"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                <span className="text-xs">👨‍⚕️</span>
                <span>Dr. {appointment.doctorName || "Unknown"}</span>
              </div>
            </div>

            {/* Vitals Display */}
            {appointment.hasVitals && appointment.vitalSigns && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {appointment.vitalSigns.bloodPressure && (
                  <div className="bg-gray-50 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Blood Pressure</span>
                    <span className="text-[10px] md:text-[12px] font-semibold text-gray-900">{appointment.vitalSigns.bloodPressure} <span className="text-[10px] font-normal text-gray-500">mmHg</span></span>
                  </div>
                )}
                {appointment.vitalSigns.heartRate && (
                  <div className="bg-gray-50 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Heart Rate</span>
                    <span className="text-[10px] md:text-[12px] font-semibold text-gray-900">{appointment.vitalSigns.heartRate} <span className="text-[10px] font-normal text-gray-500">bpm</span></span>
                  </div>
                )}
                {appointment.vitalSigns.temperature && (
                  <div className="bg-gray-50 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Temperature</span>
                    <span className="text-[10px] md:text-[12px] font-semibold text-gray-900">{appointment.vitalSigns.temperature} <span className="text-[10px] font-normal text-gray-500">°C</span></span>
                  </div>
                )}
                {appointment.vitalSigns.weight && (
                  <div className="bg-gray-50 p-2 rounded flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Weight</span>
                    <span className="text-[10px] md:text-[12px] font-semibold text-gray-900">{appointment.vitalSigns.weight} <span className="text-[10px] font-normal text-gray-500">kg</span></span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Stethoscope size={14} />
                <span>Appointment ID: {appointment.id ? appointment.id.slice(0, 8) + '...' : 'N/A'}</span>
              </div>
              <button
                className={`whitespace-nowrap px-3 py-1 rounded-lg transition-colors text-xs ${appointment.hasVitals ? "bg-gray-100 text-gray-600 cursor-default" : "bg-[#44CE2D] text-white hover:bg-[#3bb025]"}`}
                onClick={() => {
                  if (!appointment.hasVitals) {
                    setSelectedPatientId(appointment.patientId);
                    setSelectedPatientName(appointment.patientName);
                    setSelectedBookingId(appointment.id);
                    setIsVitalsModalOpen(true);
                  }
                }}
                disabled={appointment.hasVitals}
              >
                {appointment.hasVitals
                  ? "Vitals Done"
                  : "Add Vitals"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] md:text-[12px]">
          <span className="text-gray-600 text-[10px] md:text-[12px]">Upcoming Schedule: {totalUpcoming} appointments</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-[10px] md:text-[12px]">Vitals Done: {completedVitals}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-[10px] md:text-[12px]">Pending: {pendingVitals}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-600 text-[10px] md:text-[12px]">Urgent: {urgentCases}</span>
            </div>
          </div>
        </div>
      </div>

      <AddVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => {
          setIsVitalsModalOpen(false);
          setSelectedPatientId("");
          setSelectedPatientName("");
          setSelectedBookingId("");
        }}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
        bookingId={selectedBookingId}
      />
    </div>
  );
};

export default NurseBookingsWidget;