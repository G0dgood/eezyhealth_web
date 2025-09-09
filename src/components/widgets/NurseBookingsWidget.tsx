"use client";

import React from "react";
import {
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: "Video" | "In-Person" | "Call" | "Chat";
  status: "Confirmed" | "Pending" | "Cancelled";
  specialization: string;
}

const NurseBookingsWidget: React.FC = () => {
  // Sample booking data - this would come from your API
  const bookings: Booking[] = [
    {
      id: "1",
      patientName: "Sarah Johnson",
      doctorName: "Dr. Mary Paul",
      time: "09:00 AM",
      type: "Video",
      status: "Confirmed",
      specialization: "ENT",
    },
    {
      id: "2",
      patientName: "Michael Chen",
      doctorName: "Dr. Paul Moses",
      time: "10:30 AM",
      type: "In-Person",
      status: "Pending",
      specialization: "Dermatology",
    },
    {
      id: "3",
      patientName: "Emma Wilson",
      doctorName: "Dr. Mary Paul",
      time: "02:00 PM",
      type: "Call",
      status: "Confirmed",
      specialization: "Cardiology",
    },
    {
      id: "4",
      patientName: "David Brown",
      doctorName: "Dr. Paul Moses",
      time: "03:30 PM",
      type: "Chat",
      status: "Pending",
      specialization: "ENT",
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="w-4 h-4" />;
      case "In-Person":
        return <User className="w-4 h-4" />;
      case "Call":
        return <Phone className="w-4 h-4" />;
      case "Chat":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "text-blue-600";
      case "In-Person":
        return "text-purple-600";
      case "Call":
        return "text-green-600";
      case "Chat":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
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
              Today&apos;s Bookings
            </h3>
            <p className="text-sm text-gray-500">Manage patient appointments</p>
          </div>
        </div>
        <Link
          href="/nurse/bookings"
          className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-sm font-medium">
          View All
        </Link>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-white ${getTypeColor(
                    booking.type
                  )}`}>
                  {getTypeIcon(booking.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {booking.patientName}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {booking.specialization}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  booking.status
                )}`}>
                {booking.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{booking.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {booking.doctorName}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-medium ${getTypeColor(booking.type)}`}>
                {booking.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Booking Summary
            </h4>
            <p className="text-xs text-gray-600">
              {bookings.filter((b) => b.status === "Confirmed").length}{" "}
              confirmed, {bookings.filter((b) => b.status === "Pending").length}{" "}
              pending
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#44CE2D]">
              {bookings.length} Total
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseBookingsWidget;
