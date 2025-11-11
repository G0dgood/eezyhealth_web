"use client";

import React, { useMemo } from "react";
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Stethoscope } from "lucide-react";
import { useGetBookingsQuery } from "@/store/api";
import { convertBookingsToStandardFormat, StandardBookingData } from "@/utils/bookingDataConverter";

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

  const todayAppointments = useMemo(() => {
    const today = new Date();
    const todayString = today.toLocaleDateString("en-CA");

    return standardizedBookings
      .filter((booking) => {
        if (!booking?.bookingDate?._seconds) return false;
        const bookingDate = new Date(booking.bookingDate._seconds * 1000);
        return bookingDate.toLocaleDateString("en-CA") === todayString;
      })
      .map((booking) => {
        const raw = booking as unknown as BookingData & StandardBookingData & { vital_signs?: unknown; reason?: string };
        return {
          id: booking.bookingId,
          patientName: booking.patientName,
          doctorName: booking.doctorName,
          appointmentTime: slotToTime(booking.slot),
          status: booking.bookingStatus?.toLowerCase?.() ?? "pending",
          vitalSigns: raw.vital_signs,
          reason: raw.reason || booking.comments?.[0],
        };
      });
  }, [standardizedBookings]);

  // Get recent appointments (last 5)
  const recentAppointments = [...todayAppointments]
    .sort((a, b) => {
      const timeA = a.appointmentTime || "00:00";
      const timeB = b.appointmentTime || "00:00";
      return timeA.localeCompare(timeB);
    })
    .slice(0, 5);

  // Calculate statistics
  const totalToday = todayAppointments.length;
  const pendingVitals = todayAppointments.filter(
    (booking) => !booking.vitalSigns
  ).length;
  const completedVitals = todayAppointments.filter(
    (booking) => booking.vitalSigns
  ).length;
  const urgentCases = todayAppointments.filter(
    (booking) =>
      typeof booking.reason === "string" &&
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

  if (recentAppointments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Appointments Today
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            No appointments scheduled for today. Check back later for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Today's Appointments</h3>
            <p className="text-sm text-gray-500">Patient care schedule</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalToday}</div>
          <div className="text-xs text-gray-600">Total Today</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{completedVitals}</div>
          <div className="text-xs text-gray-600">Vitals Done</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{pendingVitals}</div>
          <div className="text-xs text-gray-600">Pending Vitals</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{urgentCases}</div>
          <div className="text-xs text-gray-600">Urgent Cases</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {recentAppointments.map((appointment: BookingData, index: number) => (
          <div
            key={appointment.id || `appointment-${index}`}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {appointment.patientName || appointment.patient_name || "Unknown Patient"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {appointment.doctorName || appointment.doctor_name || "Unknown Doctor"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    appointment.status,
                    !!(appointment as unknown as { vitalSigns?: unknown }).vitalSigns || !!appointment.vital_signs
                  )}`}>
                  {(appointment as unknown as { vitalSigns?: unknown }).vitalSigns || appointment.vital_signs
                    ? "Vitals Done"
                    : "Pending Vitals"}
                </span>
                {getPriorityIcon(
                  (appointment as unknown as { reason?: string }).reason ||
                    (appointment as unknown as { comments?: unknown[] }).comments?.[0] as string | undefined
                )}
              </div>
            </div>

            <div className="space-y-2">
              {(appointment as unknown as { appointmentTime?: string }).appointmentTime ||
              appointment.appointment_time ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">🕐</span>
                  <span>
                    {formatTime(
                      (appointment as unknown as { appointmentTime?: string }).appointmentTime ||
                        appointment.appointment_time
                    )}
                  </span>
                </div>
              ) : null}
              {((appointment as unknown as { reason?: string }).reason ||
                (appointment as unknown as { comments?: unknown[] }).comments?.[0]) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">📋</span>
                  <span>
                    {(appointment as unknown as { reason?: string }).reason ||
                      ((appointment as unknown as { comments?: unknown[] }).comments?.[0] as string) ||
                      "Consultation"}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">👨‍⚕️</span>
                <span>Dr. {appointment.doctorName || appointment.doctor_name || "Unknown"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Stethoscope size={14} />
                <span>Appointment ID: {appointment.id ? appointment.id.slice(0, 8) + '...' : 'N/A'}</span>
              </div>
              <button className="px-3 py-1 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-xs">
                {(appointment as unknown as { vitalSigns?: unknown }).vitalSigns || appointment.vital_signs
                  ? "View Vitals"
                  : "Take Vitals"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Today's Schedule: {totalToday} appointments</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Vitals Done: {completedVitals}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">Pending: {pendingVitals}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">Urgent: {urgentCases}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseBookingsWidget;