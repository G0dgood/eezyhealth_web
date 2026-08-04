"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  Video,
  MessageSquare,
  Phone,
} from "lucide-react";
import { useGetBookingsQuery } from "@/store/bookingApi";
import Modal from "@/components/modals/Modal";
import { User, CalendarDays } from "lucide-react";
import { convertSlotToTime } from "@/components/Options";

interface Booking {
  id: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  bookingDate?: any;
  time?: string;
  slot?: string;
  status?: string;
  bookingStatus?: string;
  channel?: string;
  bookingChannel?: string;
  specialization?: string;
}

// The booking docs store time as `slot`, channel as `bookingChannel`, and
// status as `bookingStatus`. Resolve across the possible field names.
const getBookingTime = (b: Booking): string =>
  b.time || (b.slot ? convertSlotToTime(b.slot) : "") || "—";
const getBookingChannel = (b: Booking): string =>
  b.channel || b.bookingChannel || "";
const getBookingStatus = (b: Booking): string =>
  b.status || b.bookingStatus || "";

const AdminCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Fetch bookings data
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});

  // Ensure bookings is always an array
  let bookings: Booking[] = [];
  if (Array.isArray(bookingsData?.bookings)) {
    bookings = bookingsData.bookings;
  } else if (Array.isArray(bookingsData)) {
    bookings = bookingsData;
  } else if (
    bookingsData &&
    typeof bookingsData === "object" &&
    Array.isArray(bookingsData.data)
  ) {
    bookings = bookingsData.data;
  }

  // Local YYYY-MM-DD key for a Date (avoids UTC day-shift from toISOString).
  const localKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Resolve a booking's date across the shapes the API returns (bookingDate as a
  // Firestore Timestamp / { _seconds } object, or a plain string). Returns null
  // for missing/invalid dates instead of throwing on toISOString().
  const toBookingKey = (b: any): string | null => {
    const raw = b?.bookingDate ?? b?.date;
    if (!raw) return null;
    let d: Date;
    if (typeof raw === "object") {
      if (raw._seconds) d = new Date(raw._seconds * 1000);
      else if (raw.seconds) d = new Date(raw.seconds * 1000);
      else if (typeof raw.toDate === "function") d = raw.toDate();
      else d = new Date(raw);
    } else {
      d = new Date(raw);
    }
    return isNaN(d.getTime()) ? null : localKey(d);
  };

  // Get today's bookings
  const today = new Date();
  const todayString = localKey(today);

  const todaysBookings = bookings.filter(
    (booking: Booking) => toBookingKey(booking) === todayString,
  );

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        day: prevDate.getDate(),
        currentMonth: false,
        hasBooking: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateString = localKey(currentDate);
      const hasBooking = bookings.some(
        (booking: Booking) => toBookingKey(booking) === dateString,
      );

      days.push({
        date: currentDate,
        day: i,
        currentMonth: true,
        hasBooking,
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        day: nextDate.getDate(),
        currentMonth: false,
        hasBooking: false,
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getChannelIcon = (channel: string | undefined) => {
    switch (channel?.toLowerCase()) {
      case "video":
      case "videocall":
        return <Video size={14} className="text-blue-600" />;
      case "chat":
        return <MessageSquare size={14} className="text-green-600" />;
      case "call":
      case "voicecall":
        return <Phone size={14} className="text-purple-600" />;
      default:
        return <Calendar size={14} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const calendarDays = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
        Error loading calendar data. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Calendar</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">Appointment calendar</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="font-semibold text-gray-900">
            {formatDate(currentDate)}
          </h4>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              onClick={() =>
                dayData.hasBooking && setSelectedDay(dayData.date)
              }
              className={`p-2 text-[10px] md:text-[12px] rounded-lg transition-colors text-center ${dayData.currentMonth
                ? "text-gray-900 hover:bg-gray-100"
                : "text-gray-400"
                } ${dayData.hasBooking
                  ? "bg-green-50 border border-green-200 cursor-pointer hover:border-green-400"
                  : ""
                }`}>
              <div className="flex items-center justify-center">
                <span>{dayData.day}</span>
                {dayData.hasBooking && (
                  <div className="w-1 h-1 bg-green-500 rounded-full ml-1"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[14px] md:text-[16px] font-semibold text-gray-900">
            Today&apos;s Schedule
          </h4>
          <span className="text-[10px] md:text-[12px] text-gray-500">
            {todaysBookings.length} appointments
          </span>
        </div>

        {todaysBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysBookings.slice(0, 4).map((booking: Booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 hover:border-purple-200 transition-colors cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
                    {getChannelIcon(getBookingChannel(booking))}
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-gray-900 text-[10px] md:text-[12px] truncate">
                        {booking.patientName || "Unknown Patient"}
                      </h5>
                      <p className="text-xs text-gray-600 truncate">
                        with {booking.doctorName || "Unknown Doctor"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`self-start sm:self-auto px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      getBookingStatus(booking)
                    )} flex-shrink-0 ml-6 sm:ml-2`}>
                    {getBookingStatus(booking) || "Unknown"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{getBookingTime(booking) || "N/A"}</span>
                  </div>
                  {booking.specialization && (
                    <div className="flex items-center gap-1">
                      <Stethoscope size={12} />
                      <span>{booking.specialization}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] md:text-[12px]">
          <span className="text-gray-600 text-[10px] md:text-[12px]">
            Today: {todaysBookings.length} appointments
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Has bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span className="text-gray-600">No bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day appointments modal (opened by clicking a calendar day) */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={
          selectedDay
            ? selectedDay.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "Appointments"
        }
        size="md"
      >
        {selectedDay && (
          <div className="px-6 py-5 space-y-3">
            {(() => {
              const dayKey = localKey(selectedDay);
              const dayBookings = bookings.filter(
                (b: Booking) => toBookingKey(b) === dayKey,
              );
              if (dayBookings.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar
                      className="mx-auto mb-2 text-gray-300"
                      size={32}
                    />
                    <p className="text-sm">No appointments on this day</p>
                  </div>
                );
              }
              return (
                <>
                  <p className="text-[12px] text-gray-500">
                    {dayBookings.length} appointment
                    {dayBookings.length === 1 ? "" : "s"}
                  </p>
                  {dayBookings.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setSelectedDay(null);
                      }}
                      className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 hover:border-purple-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getChannelIcon(getBookingChannel(booking))}
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-gray-900 truncate">
                              {booking.patientName || "Unknown Patient"}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              with {booking.doctorName || "Unknown Doctor"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Clock size={12} />
                            {getBookingTime(booking) || "N/A"}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(
                              getBookingStatus(booking),
                            )}`}
                          >
                            {getBookingStatus(booking) || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Appointment detail modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Appointment Details"
        size="md"
      >
        {selectedBooking && (
          <div className="px-6 py-5">
            <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
              {(
                [
                  {
                    icon: <User className="w-4 h-4 text-purple-500" />,
                    label: "Patient",
                    value: selectedBooking.patientName || "Unknown Patient",
                  },
                  {
                    icon: <Stethoscope className="w-4 h-4 text-purple-500" />,
                    label: "Doctor",
                    value: selectedBooking.doctorName || "Unknown Doctor",
                  },
                  {
                    icon: <CalendarDays className="w-4 h-4 text-purple-500" />,
                    label: "Date",
                    value: (() => {
                      const key = toBookingKey(selectedBooking);
                      if (!key) return "—";
                      const [y, m, d] = key.split("-").map(Number);
                      return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                    })(),
                  },
                  {
                    icon: <Clock className="w-4 h-4 text-purple-500" />,
                    label: "Time",
                    value: getBookingTime(selectedBooking),
                  },
                  {
                    icon: getChannelIcon(getBookingChannel(selectedBooking)),
                    label: "Channel",
                    value: getBookingChannel(selectedBooking) || "—",
                  },
                  {
                    icon: <Stethoscope className="w-4 h-4 text-purple-500" />,
                    label: "Specialty",
                    value: selectedBooking.specialization || "—",
                  },
                ] as { icon: React.ReactNode; label: string; value: string }[]
              ).map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-[13px] text-gray-500">
                    {row.icon}
                    {row.label}
                  </span>
                  <span className="text-[13px] font-medium text-gray-900 text-right capitalize">
                    {row.value || "—"}
                  </span>
                </div>
              ))}

              {/* Status */}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-gray-500">Status</span>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    getBookingStatus(selectedBooking),
                  )}`}
                >
                  {getBookingStatus(selectedBooking) || "Unknown"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCalendarWidget;
