"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import { useAuth } from "@/contexts/AuthContext";

interface Booking {
  id?: string;
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

const StatsCards = () => {
  const { user } = useAuth();
  const doctorId = user?.uid;

  // Fetch bookings using the working hook
  const {
    data: bookingsData,
    isLoading,
    error,
  } = useBookingsByDoctorId(doctorId || null);

  const bookings: Booking[] = bookingsData || [];

  // Debug logging
  console.log("StatsCards - doctorId:", doctorId);
  console.log("StatsCards - isLoading:", isLoading);
  console.log("StatsCards - error:", error);
  console.log("StatsCards - bookingsData:", bookingsData);
  console.log("StatsCards - bookings:", bookings);

  // Calculate statistics from booking data
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter((booking: Booking) => {
    const bookingDate =
      typeof booking.bookingDate === "string"
        ? booking.bookingDate
        : typeof booking.bookingDate === "object" &&
          "seconds" in booking.bookingDate
        ? new Date((booking.bookingDate as { seconds: number }).seconds * 1000)
            .toISOString()
            .split("T")[0]
        : booking.date || new Date().toISOString().split("T")[0];
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

  const _cancelledBookings = bookings.filter(
    (booking: Booking) => booking.bookingStatus?.toLowerCase() === "cancelled"
  ).length;

  // Calculate channel statistics
  const videoCallBookings = bookings.filter(
    (booking: Booking) =>
      booking.channel === "videoCall" || booking.channel === "1"
  ).length;

  const physicalBookings = bookings.filter(
    (booking: Booking) =>
      booking.channel === "physical" || booking.channel === "4"
  ).length;

  const _chatBookings = bookings.filter(
    (booking: Booking) => booking.channel === "chat" || booking.channel === "2"
  ).length;

  const _voiceCallBookings = bookings.filter(
    (booking: Booking) =>
      booking.channel === "voiceCall" || booking.channel === "3"
  ).length;

  const hasData = totalBookings > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !bookingsData) {
    console.log("StatsCards error:", error);
    console.log("StatsCards data:", bookingsData);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Failed to load booking statistics. Please try again later.
        <div className="text-xs mt-2 text-gray-500">Error: {error}</div>
      </div>
    );
  }

  if (!hasData && !isLoading) {
    console.log("StatsCards - No data state:", {
      hasData,
      isLoading,
      bookings,
    });
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 p-6">
        <div className="w-64 h-32 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <Calendar className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          No Bookings Yet!
        </h2>
        <p className="mb-4 text-center text-lg max-w-xl text-gray-500">
          Your appointment statistics will appear here as soon as you have
          bookings.
          <br />
          Get started to unlock insights and track your appointments!
        </p>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All appointments",
      trend: "+12%",
    },
    {
      title: "Today's Appointments",
      value: todayBookings,
      icon: Clock,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today",
      trend: "+8%",
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
    {
      title: "Video Calls",
      value: videoCallBookings,
      icon: Calendar,
      gradient: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      description: "Online consultations",
      trend: "+22%",
    },
    {
      title: "In-Person",
      value: physicalBookings,
      icon: CheckCircle,
      gradient: "from-cyan-500 to-teal-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      description: "Physical appointments",
      trend: "+18%",
    },
  ];

  // Show data even if there's an error, as long as we have data
  if (error && bookingsData && bookingsData.length > 0) {
    console.log("StatsCards - Showing data despite error:", {
      error,
      bookingsData,
    });
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Appointment Statistics
            </h3>
            <p className="text-sm text-gray-500">Real-time booking insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <TrendingUp size={16} />
          <span>All metrics up</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  {item.trend && (
                    <div className="text-sm font-medium flex items-center gap-1 text-green-600">
                      ↗ {item.trend}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mb-3">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {item.value || 0}
                  </h2>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>

                {/* Trend Info */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>vs last month</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Growing</span>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              Appointment Summary
            </h4>
            <p className="text-sm text-gray-600">
              Total appointments across all statuses
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {totalBookings}
            </div>
            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              +12% this month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
