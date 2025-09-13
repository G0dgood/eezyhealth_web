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
import { useGetBookingsByDoctorIdQuery } from "@/store/api";

const StatsCards: React.FC = () => {
  const { user } = useAuth();

  // Fetch doctor's bookings data
  const { data: bookingsData, isLoading } = useGetBookingsByDoctorIdQuery(
    user?.uid || "",
    { skip: !user?.uid }
  );

  // Ensure bookings is always an array
  let bookings: unknown[] = [];
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
      description: "All time appointments",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Clock,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled for today",
      trend: "+3",
      trendUp: true,
    },
    {
      title: "Completed",
      value: completedAppointments,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Successfully completed",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Pending Reviews",
      value: pendingAppointments,
      icon: TrendingUp,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Awaiting completion",
      trend: "+2",
      trendUp: true,
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Appointment Statistics</h3>
            <p className="text-sm text-gray-500">Your practice overview</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
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
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  {item.trend && (
                    <div
                      className={`text-xs font-medium flex items-center gap-1 ${item.trendUp ? "text-green-600" : "text-red-600"
                        }`}>
                      {item.trendUp ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {item.trend}
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

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Practice Status: Active
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Total: {totalAppointments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">Today: {todayAppointments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600">Completed: {completedAppointments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;