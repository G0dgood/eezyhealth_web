"use client";

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";

interface Booking {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: "Video" | "In-Person" | "Call";
  status: "Confirmed" | "Pending" | "Cancelled";
}

const DoctorCalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample booking data - this would come from your API
  const bookings: Booking[] = [
    {
      id: "1",
      patientName: "Sarah Johnson",
      doctorName: "Dr. Smith",
      time: "09:00 AM",
      type: "Video",
      status: "Confirmed",
    },
    {
      id: "2",
      patientName: "Michael Chen",
      doctorName: "Dr. Johnson",
      time: "10:30 AM",
      type: "In-Person",
      status: "Pending",
    },
    {
      id: "3",
      patientName: "Emma Wilson",
      doctorName: "Dr. Davis",
      time: "02:00 PM",
      type: "Call",
      status: "Confirmed",
    },
    {
      id: "4",
      patientName: "David Brown",
      doctorName: "Dr. Wilson",
      time: "03:30 PM",
      type: "Video",
      status: "Pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-800";
      case "In-Person":
        return "bg-purple-100 text-purple-800";
      case "Call":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Today&apos;s Schedule
            </h3>
            <p className="text-sm text-gray-500">{formatDate(currentDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-colors ${
                  isCurrentMonth
                    ? isToday
                      ? "bg-[#44CE2D] text-white font-semibold"
                      : hasBookings
                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
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
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Today&apos;s Bookings ({bookings.length})
        </h4>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {booking.time}
                </span>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  booking.status
                )}`}>
                {booking.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {booking.patientName}
                </span>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                  booking.type
                )}`}>
                {booking.type}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              with {booking.doctorName}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Schedule Summary
            </h4>
            <p className="text-xs text-gray-600">
              {bookings.filter((b) => b.status === "Confirmed").length}{" "}
              confirmed, {bookings.filter((b) => b.status === "Pending").length}{" "}
              pending
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#44CE2D]">
              {bookings.length} Appointments
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCalendarWidget;
