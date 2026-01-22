"use client";

import React from "react";
import { Calendar, Clock, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useGetBookingsQuery } from "@/store/bookingApi";
import FormattedSlot from "@/components/common/FormattedSlot";

interface BookingData {
  id?: string;
  bookingId?: string;
  patientName?: string;
  patient_name?: string;
  doctorName?: string;
  doctor_name?: string;
  bookingDate?: string | { seconds: number; nanoseconds: number };
  appointment_date?: string;
  slot?: string;
  appointment_time?: string;
  bookingStatus?: string;
  status?: string;
  createdAt?: string;
  createdTime?: string;
  consultationReason?: string;
  reason?: string;
  bookingChannel?: string;
  [key: string]: unknown;
}

const AdminBookingsWidget: React.FC = () => {
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});

  // Ensure bookings is always an array
  let bookings: BookingData[] = [];
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

  // Get recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a: BookingData, b: BookingData) => {
      const dateA = new Date(a.createdAt || a.createdTime || 0).getTime();
      const dateB = new Date(b.createdAt || b.createdTime || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatus = (booking: BookingData) => booking.bookingStatus || booking.status || "pending";

  // Calculate booking statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (booking: BookingData) => getStatus(booking) === "confirmed" || getStatus(booking) === "accepted"
  ).length;
  const pendingBookings = bookings.filter(
    (booking: BookingData) => getStatus(booking) === "pending"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking: BookingData) => getStatus(booking) === "cancelled"
  ).length;
  const completedBookings = bookings.filter(
    (booking: BookingData) => getStatus(booking) === "completed" || getStatus(booking) === "success"
  ).length;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    let dateStr = String(dateString);
    
    // Replace " at " with space, case insensitive
    dateStr = dateStr.replace(/\s+at\s+/i, " ");
    
    // Replace narrow no-break space (U+202F) and other non-standard spaces with regular space
    dateStr = dateStr.replace(/[\u202F\u00A0]/g, " ");
    
    let date = new Date(dateStr);
    
    // If date is invalid, try removing timezone offset if present
    if (isNaN(date.getTime()) && dateStr.includes("UTC")) {
      const cleaned = dateStr.replace(/\s*UTC[+\-]?\d*$/, "");
      date = new Date(cleaned);
    }
    
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAppointmentDate = (dateVal: string | { seconds: number; nanoseconds: number } | undefined) => {
    if (!dateVal) return "N/A";
    let date: Date;
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      date = new Date(dateVal.seconds * 1000);
    } else if (typeof dateVal === 'string') {
      let dateStr = dateVal;
      // Handle Firebase formatted dates like "January 27, 2026 at 1:00:00 AM UTC+1"
      // Replace " at " with space, case insensitive
      dateStr = dateStr.replace(/\s+at\s+/i, " ");
      
      // Replace narrow no-break space (U+202F) and other non-standard spaces with regular space
      dateStr = dateStr.replace(/[\u202F\u00A0]/g, " ");
      
      date = new Date(dateStr);
      
      // If date is invalid, try removing timezone offset if present (e.g. UTC+1 which might confuse some parsers)
      if (isNaN(date.getTime()) && dateStr.includes("UTC")) {
        const cleaned = dateStr.replace(/\s*UTC[+\-]?\d*$/, "");
        date = new Date(cleaned);
      }
    } else if (typeof dateVal === 'number') {
      date = new Date(dateVal);
    } else {
      date = new Date(String(dateVal));
    }
    
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
      case "success":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "accepted":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "cancelled":
        return <AlertCircle size={14} className="text-red-600" />;
      case "completed":
      case "success":
        return <CheckCircle size={14} className="text-blue-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
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
        Error loading bookings. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (recentBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Bookings Found
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            No booking records found yet. Bookings will appear here once they are created.
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
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-xs md:text-sm text-gray-500">Latest appointment bookings</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-blue-600">{totalBookings}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-green-600">{confirmedBookings}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Confirmed</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-yellow-600">{pendingBookings}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-red-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-red-600">{cancelledBookings}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="space-y-3 md:space-y-4">
        {recentBookings.map((booking: BookingData, index: number) => (
          <div
            key={booking.id || `booking-${index}`}
            className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 md:mb-3 gap-2">
              <div className="flex items-center gap-2 md:gap-3 overflow-hidden w-full sm:w-auto">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm md:text-base text-gray-900 truncate">
                    {booking.patientName || booking.patient_name || "Unknown Patient"}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {booking.doctorName || booking.doctor_name || "Unknown Doctor"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto ml-10 sm:ml-0">
                <span
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getStatusColor(
                    getStatus(booking)
                  )}`}>
                  {getStatus(booking)}
                </span>
                {getStatusIcon(getStatus(booking))}
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
             
              {(booking.slot || booking.appointment_time) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">🕐</span>
                  {booking.slot ? <FormattedSlot slot={booking.slot} /> : <span>{booking.appointment_time}</span>}
                </div>
              )}
              {(booking.consultationReason || booking.reason) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">📋</span>
                  <span>{booking.consultationReason || booking.reason}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">📅</span>
                <span>Booked: {formatDate(booking.createdAt || booking.createdTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar size={14} />
                <span>Booking ID: {(booking.bookingId || booking.id || "").slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <span className="text-gray-600 text-xs md:text-sm">Total Bookings: {totalBookings}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Confirmed: {confirmedBookings}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Pending: {pendingBookings}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Cancelled: {cancelledBookings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsWidget;