"use client";

import React, { useState } from "react";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import Modal from "@/components/modals/Modal";

interface Booking {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: "Video" | "In-Person" | "Call";
  status: "Confirmed" | "Pending" | "Cancelled";
}

const NurseCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Sample booking data - this would come from your API
  const bookings: Booking[] = [
    {
      id: "1",
      patientName: "Sarah Johnson",
      doctorName: "Dr. Mary Paul",
      time: "09:00 AM",
      type: "Video",
      status: "Confirmed",
    },
    {
      id: "2",
      patientName: "Michael Chen",
      doctorName: "Dr. Paul Moses",
      time: "10:30 AM",
      type: "In-Person",
      status: "Pending",
    },
    {
      id: "3",
      patientName: "Emma Wilson",
      doctorName: "Dr. Mary Paul",
      time: "02:00 PM",
      type: "Call",
      status: "Confirmed",
    },
    {
      id: "4",
      patientName: "David Brown",
      doctorName: "Dr. Paul Moses",
      time: "03:30 PM",
      type: "Video",
      status: "Pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "In-Person":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "Call":
        return "bg-green-100 text-green-800 border border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] md:tex font-bold text-gray-900">
              Today&apos;s Schedule
            </h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">{formatDate(currentDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4 md:mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-[10px] md:text-xs font-medium text-gray-500 py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              i - 6
            );
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const hasBookings = i === 15; // Sample: show bookings on day 15

            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-[10px] md:text-xs rounded-lg cursor-pointer transition-colors ${isCurrentMonth
                  ? isToday
                    ? "bg-[#44CE2D] text-white font-semibold"
                    : hasBookings
                      ? "bg-blue-50 text-blue-600 border border-blue-300 font-medium hover:bg-blue-100"
                      : "text-gray-900 hover:bg-gray-100"
                  : "text-gray-400"
                  }`}>
                {isCurrentMonth ? date.getDate() : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="space-y-2 md:space-y-3">
        <h4 className="text-[10px] md:text-[12px] font-semibold text-gray-900 mb-2 md:mb-3">
          Today&apos;s Bookings ({bookings.length})
        </h4>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() => setSelectedBooking(booking)}
            className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-green-200 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                <span className="text-[10px] md:text-[12px] font-medium text-gray-900">
                  {booking.time}
                </span>
              </div>
              <span
                className={`inline-flex px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${getStatusColor(
                  booking.status
                )}`}>
                {booking.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex-shrink-0" />
                <span className="text-[10px] md:text-[12px] text-gray-700 truncate">
                  {booking.patientName}
                </span>
              </div>
              <span
                className={`flex-shrink-0 inline-flex px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${getTypeColor(
                  booking.type
                )}`}>
                {booking.type}
              </span>
            </div>
            <div className="mt-1 text-[10px] md:text-xs text-gray-500">
              with {booking.doctorName}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h4 className="text-[10px] md:text-[12px] font-semibold text-gray-900 mb-0.5 md:mb-1">
              Schedule Summary
            </h4>
            <p className="text-[10px] md:text-xs text-gray-600">
              {bookings.filter((b) => b.status === "Confirmed").length}{" "}
              confirmed, {bookings.filter((b) => b.status === "Pending").length}{" "}
              pending
            </p>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
            <div className="text-[10px] md:text-[12px] font-bold text-[#44CE2D]">
              {bookings.length} Appointments
            </div>
            <div className="text-[10px] md:text-xs text-gray-600">Today</div>
          </div>
        </div>
      </div>

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
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-gray-500">
                  <User className="w-4 h-4 text-[#44CE2D]" />
                  Patient
                </span>
                <span className="text-[13px] font-medium text-gray-900 text-right">
                  {selectedBooking.patientName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-gray-500">
                  <User className="w-4 h-4 text-[#44CE2D]" />
                  Doctor
                </span>
                <span className="text-[13px] font-medium text-gray-900 text-right">
                  {selectedBooking.doctorName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-gray-500">
                  <Clock className="w-4 h-4 text-[#44CE2D]" />
                  Time
                </span>
                <span className="text-[13px] font-medium text-gray-900 text-right">
                  {selectedBooking.time || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex items-center gap-2 text-[13px] text-gray-500">
                  <CalendarDays className="w-4 h-4 text-[#44CE2D]" />
                  Channel
                </span>
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                    selectedBooking.type,
                  )}`}
                >
                  {selectedBooking.type || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-[13px] text-gray-500">Status</span>
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    selectedBooking.status,
                  )}`}
                >
                  {selectedBooking.status || "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NurseCalendarWidget;
