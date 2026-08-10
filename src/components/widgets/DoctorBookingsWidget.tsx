"use client";

import React from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import FormattedSlot from "@/components/common/FormattedSlot";

interface Booking {
  id: string;
  bookingId?: string;
  userId: string;
  patientName?: string;
  patientDisplayName?: string;
  first_name?: string;
  photo_url?: string;
  timestamp?: string;
  lastMessage?: string;
  isOnline?: boolean;
  date?: string;
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  specialization?: string;
  bookingDate?: string | { seconds: number; nanoseconds: number };
  bookingTime?: string;
  slot?: string;
  bookingStatus?: string;
  channel?: string;
  bookingChannel?: string;
  consultationReason?: string;
  reason?: string;
  contactNumber?: string;
  createdAt?: string;
  createdTime?: string;
  updatedTime?: string;
  updatedAt?: string;
  patientAddress?: string;
  cancellationRequest?: {
    reason: string;
    status: string;
    requestedAt: string;
    adminResponse?: string;
  };
  [key: string]: unknown;
}

const DoctorBookingsWidget: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.uid;

  // Fetch bookings using the working hook
  const {
    data: bookingsData,
    isLoading,
  } = useBookingsByDoctorId(doctorId || null);

  const bookings: Booking[] = (bookingsData || []).map((booking) => ({
    ...booking,
    id: booking.id || `booking-${Math.random()}`,
  }));



  const parseBookingDate = (dateVal: string | { seconds: number; nanoseconds: number } | number | undefined): Date | null => {
    if (!dateVal) return null;
    let date: Date;
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      date = new Date(dateVal.seconds * 1000);
    } else if (typeof dateVal === 'string') {
      let dateStr = dateVal;
      // Replace " at " with space, case insensitive
      dateStr = dateStr.replace(/\s+at\s+/i, " ");
      // Replace narrow no-break space (U+202F) and other non-standard spaces with regular space
      dateStr = dateStr.replace(/[\u202F\u00A0]/g, " ");

      date = new Date(dateStr);

      // If date is invalid, try removing timezone offset if present
      if (isNaN(date.getTime()) && dateStr.includes("UTC")) {
        const cleaned = dateStr.replace(/\s*UTC[+\-]?\d*$/, "");
        date = new Date(cleaned);
      }
    } else if (typeof dateVal === 'number') {
      date = new Date(dateVal);
    } else {
      date = new Date(String(dateVal));
    }
    return isNaN(date.getTime()) ? null : date;
  };

  // Calculate statistics
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((booking: Booking) => {
    const date = parseBookingDate(booking.bookingDate || booking.date);
    if (!date) return false;
    const today = new Date();
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  }).length;

  const confirmedBookings = bookings.filter(
    (booking: Booking) =>
      booking.bookingStatus?.toLowerCase() === "confirmed" ||
      booking.bookingStatus?.toLowerCase() === "accepted"
  ).length;

  const pendingBookings = bookings.filter(
    (booking: Booking) => booking.bookingStatus?.toLowerCase() === "pending"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking: Booking) => booking.bookingStatus?.toLowerCase() === "cancelled"
  ).length;

  // Get recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a: Booking, b: Booking) => {
      const dateA = parseBookingDate(a.createdAt || a.createdTime || a.bookingDate || a.date)?.getTime() || 0;
      const dateB = parseBookingDate(b.createdAt || b.createdTime || b.bookingDate || b.date)?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "confirmed":
      case "accepted":
        return "bg-green-100 text-green-800 border border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      case "completed":
      case "success":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "confirmed":
      case "accepted":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={14} className="text-red-600" />;
      case "completed":
      case "success":
        return <CheckCircle size={14} className="text-blue-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    const ch = channel?.toLowerCase() || "";
    if (ch.includes("video") || ch === "1") return <Video size={14} className="text-blue-600" />;
    if (ch.includes("voice") || ch === "3") return <Phone size={14} className="text-green-600" />;
    if (ch.includes("chat") || ch === "2") return <MessageCircle size={14} className="text-purple-600" />;
    if (ch.includes("person") || ch.includes("physical") || ch === "4") return <MapPin size={14} className="text-orange-600" />;
    return <Video size={14} className="text-blue-600" />;
  };

  const getChannelText = (channel: string) => {
    const ch = channel?.toLowerCase() || "";
    if (ch.includes("video") || ch === "1") return "Video Call";
    if (ch.includes("voice") || ch === "3") return "Voice Call";
    if (ch.includes("chat") || ch === "2") return "Chat";
    if (ch.includes("person") || ch.includes("physical") || ch === "4") return "In-Person";
    return channel || "Video Call";
  };

  const formatDate = (
    bookingDate: string | { seconds: number; nanoseconds: number } | number | undefined
  ) => {
    const date = parseBookingDate(bookingDate);
    if (!date) return "N/A";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toISOString().split("T")[0];
    const todayString = today.toISOString().split("T")[0];
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    if (dateString === todayString) return "Today";
    if (dateString === tomorrowString) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const statsData = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All appointments"
    },
    {
      title: "Today's Appointments",
      value: todayBookings,
      icon: Clock,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today"
    },
    {
      title: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Ready to proceed"
    },
    {
      title: "Pending",
      value: pendingBookings,
      icon: AlertCircle,
      gradient: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting confirmation"
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // On error, fall through to the render below (it shows its own "No
  // appointments found" empty state) rather than showing a raw error message.

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900">
              Appointment Overview
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              Your booking statistics and recent appointments
            </p>
          </div>
        </div>
        <Link
          href="/doctor/bookings"
          className="text-blue-600 text-xs md:text-sm font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${item.iconColor}`} />
                  </div>

                </div>

                <div className="mb-1 md:mb-2">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-0.5 md:mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base md:text-lg font-semibold text-gray-900">
            Recent Appointments
          </h4>
          <span className="text-xs md:text-sm text-gray-500">
            {recentBookings.length} appointments
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <Calendar className="mx-auto mb-2 text-gray-300" size={24} />
            <p className="text-xs">No appointments found</p>
          </div>
        ) : (
          recentBookings.map((booking: Booking) => (
            <div
              key={booking.id}
              className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 md:mb-3 gap-2">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm md:text-base text-gray-900 truncate">
                      {booking.patientName || booking.first_name || "Patient"}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {booking.specialization || "Specialization"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto ml-0 sm:ml-2">
                  <span
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 text-xs font-medium rounded-full ${getStatusColor(
                      booking.bookingStatus || "unknown"
                    )}`}>
                    {booking.bookingStatus || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {formatDate(booking.bookingDate || booking.date || "")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Clock size={14} />
                  <FormattedSlot slot={booking.slot || booking.bookingTime || ""} />
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  {getChannelIcon(booking.bookingChannel || booking.channel || "")}
                  <span>{getChannelText(booking.bookingChannel || booking.channel || "")}</span>
                </div>
                {booking.patientAddress ? (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{String(booking.patientAddress)}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getStatusIcon(booking.bookingStatus || "unknown")}
                  <span>{booking.bookingStatus || "Unknown"}</span>
                </div>
                <Link
                  href="/doctor/bookings"
                  className="text-blue-600 text-xs font-medium hover:text-blue-700">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs md:text-sm">
          <span className="text-gray-600 text-xs md:text-sm">
            Total Appointments: {totalBookings}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">
                Confirmed: {confirmedBookings}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Pending: {pendingBookings}</span>
            </div>
            {cancelledBookings > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-gray-600 text-xs md:text-sm">
                  Cancelled: {cancelledBookings}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBookingsWidget;