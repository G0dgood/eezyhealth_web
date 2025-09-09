"use client";

import React from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Eye,
  MoreVertical,
} from "lucide-react";
import { useGetBookingsQuery } from "@/store/api";
import Link from "next/link";

interface Booking {
  id: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  status?: string;
  channel?: string;
  specialization?: string;
  createdAt?: string;
}

const AdminBookingsWidget: React.FC = () => {
  // Fetch bookings data from admin bookings page
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

  // Get recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a: Booking, b: Booking) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Calculate booking statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking: Booking) => booking.status?.toLowerCase() === "pending"
  ).length;
  const completedBookings = bookings.filter(
    (booking: Booking) => booking.status?.toLowerCase() === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking: Booking) => booking.status?.toLowerCase() === "cancelled"
  ).length;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChannelIcon = (channel: string | undefined) => {
    switch (channel?.toLowerCase()) {
      case "video":
      case "videocall":
        return "📹";
      case "chat":
        return "💬";
      case "call":
      case "voicecall":
        return "📞";
      default:
        return "📅";
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
            No booking records found yet. Bookings will appear here once
            patients make appointments.
          </p>
          <Link
            href="/admin/bookings"
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-sm font-medium">
            View All Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Latest appointment bookings</p>
          </div>
        </div>
        <Link
          href="/admin/bookings"
          className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {totalBookings}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {pendingBookings}
          </div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {completedBookings}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {cancelledBookings}
          </div>
          <div className="text-xs text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="space-y-4">
        {recentBookings.map((booking: Booking) => (
          <div
            key={booking.id}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">
                    {getChannelIcon(booking.channel)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {booking.patientName || "Unknown Patient"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    with {booking.doctorName || "Unknown Doctor"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    booking.status
                  )}`}>
                  {booking.status || "Unknown"}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                <span>{formatTime(booking.time)}</span>
              </div>
              {booking.specialization && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Stethoscope size={14} />
                  <span>{booking.specialization}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User size={14} />
                <span>{booking.patientName || "Unknown Patient"}</span>
              </div>
              <Link
                href="/admin/bookings"
                className="text-blue-600 text-xs font-medium hover:text-blue-700">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Bookings: {totalBookings}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">Pending: {pendingBookings}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                Completed: {completedBookings}
              </span>
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

export default AdminBookingsWidget;
