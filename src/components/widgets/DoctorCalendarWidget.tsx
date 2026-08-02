"use client";

import React, { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Video, Phone, MessageCircle, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import FormattedSlot from "@/components/common/FormattedSlot";

const DoctorCalendarWidget: React.FC = () => {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useBookingsByDoctorId(user?.uid || null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Parse bookings and memoize
  const parsedBookings = useMemo(() => {
    if (!bookingsData) return [];

    return bookingsData.map(booking => {
      let date: Date | null = null;
      const dateVal = booking.bookingDate || booking.date;

      if (typeof dateVal === 'object' && dateVal && 'seconds' in dateVal) {
        date = new Date((dateVal as { seconds: number }).seconds * 1000);
      } else if (typeof dateVal === 'string') {
        let dateStr = dateVal;
        dateStr = dateStr.replace(/\s+at\s+/i, " ");
        dateStr = dateStr.replace(/[\u202F\u00A0]/g, " ");
        date = new Date(dateStr);
        if (isNaN(date.getTime()) && dateStr.includes("UTC")) {
          const cleaned = dateStr.replace(/\s*UTC[+\-]?\d*$/, "");
          date = new Date(cleaned);
        }
      } else if (typeof dateVal === 'number') {
        date = new Date(dateVal);
      }

      if (!date || isNaN(date.getTime())) return null;

      return {
        id: String(booking.id),
        patientName: String(booking.patientName || booking.first_name || "Unknown Patient"),
        doctorName: String(booking.doctorName || "Dr. " + (user?.displayName || "Unknown")),
        time: String(booking.slot || booking.bookingTime || "N/A"),
        type: String(booking.bookingChannel || booking.channel || "Video Call"),
        status: String(booking.bookingStatus || "Pending"),
        date: date
      };
    }).filter((b): b is NonNullable<typeof b> => b !== null);
  }, [bookingsData, user?.displayName]);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'confirmed') return "bg-green-100 text-green-800 border border-green-300";
    if (s === 'pending') return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    if (s === 'cancelled') return "bg-red-100 text-red-800 border border-red-300";
    return "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('video')) return "bg-blue-100 text-blue-800 border border-blue-300";
    if (t.includes('person')) return "bg-purple-100 text-purple-800 border border-purple-300";
    if (t.includes('call') || t.includes('phone')) return "bg-green-100 text-green-800 border border-green-300";
    return "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const getChannelIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('video')) return <Video className="w-3.5 h-3.5 text-blue-500" />;
    if (lowerType.includes('voice') || lowerType.includes('audio') || lowerType.includes('call')) return <Phone className="w-3.5 h-3.5 text-green-500" />;
    if (lowerType.includes('chat')) return <MessageCircle className="w-3.5 h-3.5 text-purple-500" />;
    return <MapPin className="w-3.5 h-3.5 text-orange-500" />;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newMonth = direction === "prev" ? prev.getMonth() - 1 : prev.getMonth() + 1;
      const newYear = prev.getFullYear() + Math.floor(newMonth / 12);
      const normalizedMonth = ((newMonth % 12) + 12) % 12;
      const next = new Date(prev);
      next.setFullYear(newYear, normalizedMonth, 1);
      return next;
    });
    setSelectedDate((prev) => {
      const base = new Date(prev);
      const newMonth = direction === "prev" ? base.getMonth() - 1 : base.getMonth() + 1;
      const newYear = base.getFullYear() + Math.floor(newMonth / 12);
      const normalizedMonth = ((newMonth % 12) + 12) % 12;
      const lastDayOfNewMonth = new Date(newYear, normalizedMonth + 1, 0).getDate();
      const day = Math.min(base.getDate(), lastDayOfNewMonth);
      return new Date(newYear, normalizedMonth, day);
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Get calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      const d = new Date(year, month, -startingDayOfWeek + 1 + i);
      days.push({ date: d, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month padding (to fill 35 or 42 slots)
    const remainingSlots = 42 - days.length; // Ensure 6 rows for consistency
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const selectedDateBookings = parsedBookings.filter(b => isSameDay(b.date, selectedDate));

  // Check if a day has bookings
  const hasBookings = (date: Date) => {
    return parsedBookings.some(b => isSameDay(b.date, date));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">
              Calendar
            </h3>
            <p className="text-[8px] md:text-[10px] md:text-[12px] text-gray-500">{formatDate(currentDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateMonth("prev")}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => navigateMonth("next")}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayObj, i) => {
            const { date, isCurrentMonth } = dayObj;
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            const dayHasBookings = hasBookings(date);

            return (
              <div
                key={i}
                onClick={() => {
                  setSelectedDate(date);
                  // Also switch calendar view month if clicking a day from another month
                  if (!isCurrentMonth) {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(date.getMonth());
                    newDate.setFullYear(date.getFullYear());
                    setCurrentDate(newDate);
                  }
                }}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all relative
                  ${isSelected
                    ? "bg-[#44CE2D] text-white font-semibold shadow-sm"
                    : isToday
                      ? "bg-green-50 text-green-700 border border-green-300 font-bold border border-green-200"
                      : isCurrentMonth
                        ? "text-gray-900 hover:bg-gray-100"
                        : "text-gray-300"
                  }
                `}>
                {date.getDate()}
                {dayHasBookings && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Bookings */}
      <div className="space-y-3">
        <h4 className="text-[10px] md:text-[12px] font-semibold text-gray-900 mb-3 flex justify-between items-center">
          <span>Bookings for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span className="text-gray-500 font-normal">({selectedDateBookings.length})</span>
        </h4>

        {selectedDateBookings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-xs text-gray-500">No bookings for this date</p>
          </div>
        ) : (
          selectedDateBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] md:text-[12px] font-medium text-gray-900">
                    <FormattedSlot slot={booking.time} />
                  </span>
                </div>
                <span
                  className={`self-start sm:self-auto inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    booking.status
                  )}`}>
                  {booking.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-[10px] md:text-[12px] text-gray-700">
                    {booking.patientName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getChannelIcon(booking.type)}
                  <span
                    className={`self-start sm:self-auto inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      booking.type
                    )}`}>
                    {booking.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-[10px] md:text-[12px] font-semibold text-gray-900 mb-1">
              Monthly Overview
            </h4>
            <p className="text-xs text-gray-600">
              {parsedBookings.filter(b => b.date.getMonth() === currentDate.getMonth()).length} appointments this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarWidget;
