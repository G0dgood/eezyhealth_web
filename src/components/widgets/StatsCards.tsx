"use client";

import React from "react";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetBookingsByDoctorIdQuery } from "@/store/bookingApi";

const StatsCards: React.FC = () => {
  const { user } = useAuth();

  // Fetch doctor's bookings data
  const { data: bookingsData, isLoading } = useGetBookingsByDoctorIdQuery(
    user?.uid || "",
    { skip: !user?.uid }
  );

  // Ensure bookings is always an array
  let bookings: unknown[] = [];
  const bookingsDataTyped = bookingsData as any;
  if (Array.isArray(bookingsDataTyped?.bookings)) {
    bookings = bookingsDataTyped.bookings;
  } else if (Array.isArray(bookingsDataTyped)) {
    bookings = bookingsDataTyped;
  } else if (
    bookingsDataTyped &&
    typeof bookingsDataTyped === "object" &&
    Array.isArray(bookingsDataTyped.data)
  ) {
    bookings = bookingsDataTyped.data;
  }

  // Calculate statistics
  const totalAppointments = bookings.length;
  const todayAppointments = bookings.filter((booking: any) => {
    if (!booking.appointment_date) return false;
    const appointmentDate = new Date(booking.appointment_date);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  }).length;

  const completedAppointments = bookings.filter(
    (booking: any) => booking.status === "completed"
  ).length;

  const pendingAppointments = bookings.filter(
    (booking: any) => booking.status === "pending"
  ).length;

  const statsData = [
    {
      title: "Total Appointments",
      value: totalAppointments,
      icon: Calendar,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All time appointments"
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Clock,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled for today"
    },
    {
      title: "Completed",
      value: completedAppointments,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Successfully completed"
    },
    {
      title: "Pending Reviews",
      value: pendingAppointments,
      icon: TrendingUp,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Awaiting completion"
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Appointment Statistics</h3>
            <p className="text-xs md: !text-[10px]  !md:text-[12px] text-gray-500">Your practice overview</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsData.map((item, index) => {
          const IconComponent = item.icon as React.ElementType;
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
                  <h2 className="text-[16px] md:text-[18px] md:text-[18px] md:text-[20px] font-bold text-gray-900 mb-0.5 md:mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-xs md: !text-[10px]  !md:text-[12px] font-semibold text-gray-700 mb-0.5 md:mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4  !text-[10px]  !md:text-[12px]">
          <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">
            Practice Status: Active
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">Total: {totalAppointments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">Today: {todayAppointments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">Completed: {completedAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;