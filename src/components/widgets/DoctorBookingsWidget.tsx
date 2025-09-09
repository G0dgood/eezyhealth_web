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

interface Booking {
  id: string;
  userId: string;
  patientName?: string;
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
  bookingDate?: string;
  bookingTime?: string;
  bookingStatus?: string;
  channel?: string;
  reason?: string;
  contactNumber?: string;
  createdTime?: string;
  updatedTime?: string;
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
    error,
  } = useBookingsByDoctorId(doctorId || null);

  const bookings: Booking[] = (bookingsData || []).map((booking) => ({
    ...booking,
    id: booking.id || `booking-${Math.random()}`,
  }));

  // Debug logging
  console.log("DoctorBookingsWidget - doctorId:", doctorId);
  console.log("DoctorBookingsWidget - isLoading:", isLoading);
  console.log("DoctorBookingsWidget - error:", error);
  console.log("DoctorBookingsWidget - bookingsData:", bookingsData);
  console.log("DoctorBookingsWidget - bookings:", bookings);

  // Calculate statistics
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((booking: Booking) => {
    const bookingDate = booking.bookingDate || booking.date || "";
    const today = new Date().toISOString().split("T")[0];
    return bookingDate === today;
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
      const dateA = new Date(a.bookingDate || a.date || "").getTime();
      const dateB = new Date(b.bookingDate || b.date || "").getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
      case "accepted":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "cancelled":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "videoCall":
      case "1":
        return <Video size={14} className="text-blue-600" />;
      case "voiceCall":
      case "3":
        return <Phone size={14} className="text-green-600" />;
      case "chat":
      case "2":
        return <MessageCircle size={14} className="text-purple-600" />;
      case "physical":
      case "4":
        return <MapPin size={14} className="text-orange-600" />;
      default:
        return <Video size={14} className="text-blue-600" />;
    }
  };

  const getChannelText = (channel: string) => {
    switch (channel) {
      case "videoCall":
      case "1":
        return "Video Call";
      case "voiceCall":
      case "3":
        return "Voice Call";
      case "chat":
      case "2":
        return "Chat";
      case "physical":
      case "4":
        return "In-Person";
      default:
        return "Video Call";
    }
  };

  const formatDate = (
    bookingDate: string | { seconds: number; nanoseconds: number }
  ) => {
    const date =
      typeof bookingDate === "string"
        ? new Date(bookingDate)
        : typeof bookingDate === "object" && "seconds" in bookingDate
        ? new Date(bookingDate.seconds * 1000)
        : new Date(bookingDate as string);

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

  const formatTime = (slot: string) => {
    // Convert slot to readable time format
    const timeSlotMap: Record<string, string> = {
      midnight_12am: "12:00 AM",
      early_morning_1am: "1:00 AM",
      early_morning_2am: "2:00 AM",
      early_morning_3am: "3:00 AM",
      early_morning_4am: "4:00 AM",
      early_morning_5am: "5:00 AM",
      morning_6am: "6:00 AM",
      morning_7am: "7:00 AM",
      morning_8am: "8:00 AM",
      morning_9am: "9:00 AM",
      morning_10am: "10:00 AM",
      morning_11am: "11:00 AM",
      afternoon_12pm: "12:00 PM",
      afternoon_1pm: "1:00 PM",
      afternoon_2pm: "2:00 PM",
      afternoon_3pm: "3:00 PM",
      afternoon_4pm: "4:00 PM",
      evening_5pm: "5:00 PM",
      evening_6pm: "6:00 PM",
      evening_7pm: "7:00 PM",
      evening_8pm: "8:00 PM",
      night_9pm: "9:00 PM",
      night_10pm: "10:00 PM",
      night_11pm: "11:00 PM",
    };

    return timeSlotMap[slot] || slot;
  };

  const statsData = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All appointments",
      trend: "+8%",
    },
    {
      title: "Today's Appointments",
      value: todayBookings,
      icon: Clock,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today",
      trend: "+12%",
    },
    {
      title: "Confirmed",
      value: confirmedBookings,
      icon: CheckCircle,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Ready to proceed",
      trend: "+15%",
    },
    {
      title: "Pending",
      value: pendingBookings,
      icon: AlertCircle,
      gradient: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting confirmation",
      trend: "+5%",
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

  if (error && !bookingsData) {
    console.log("DoctorBookingsWidget error:", error);
    console.log("DoctorBookingsWidget data:", bookingsData);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Failed to load bookings. Please try again later.
        <div className="text-xs mt-2 text-gray-500">Error: {error}</div>
      </div>
    );
  }

  // Show data even if there's an error, as long as we have data
  if (error && bookingsData && bookingsData.length > 0) {
    console.log("DoctorBookingsWidget - Showing data despite error:", {
      error,
      bookingsData,
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Appointment Overview
            </h3>
            <p className="text-sm text-gray-500">
              Your booking statistics and recent appointments
            </p>
          </div>
        </div>
        <Link
          href="/doctor/bookings"
          className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  {item.trend && (
                    <div className="text-xs font-medium flex items-center gap-1 text-green-600">
                      ↗ {item.trend}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Recent Appointments
          </h4>
          <span className="text-sm text-gray-500">
            {recentBookings.length} appointments
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No appointments found</p>
          </div>
        ) : (
          recentBookings.map((booking: Booking) => (
            <div
              key={booking.id}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {booking.patientName || booking.first_name || "Patient"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.specialization || "Specialization"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      booking.bookingStatus || "unknown"
                    )}`}>
                    {booking.bookingStatus || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {formatDate(booking.bookingDate || booking.date || "")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{formatTime(booking.bookingTime || "")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getChannelIcon(booking.channel || "")}
                  <span>{getChannelText(booking.channel || "")}</span>
                </div>
                {booking.patientAddress ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{String(booking.patientAddress)}</span>
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
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Appointments: {totalBookings}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                Confirmed: {confirmedBookings}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">Pending: {pendingBookings}</span>
            </div>
            {cancelledBookings > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">
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
