"use client";

import React, { useMemo } from "react";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";
import { useGetBookingsQuery } from "@/store/bookingApi";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";

const NurseStatsCards: React.FC = () => {
  const { data: bookingsData } = useGetBookingsQuery({});
  const { data: patientsData } = useGetFirebasePatientsQuery({});

  const stats = useMemo(() => {
    // 1. Total Patients
    const totalPatients = Array.isArray(patientsData) ? patientsData.length : 0;

    // Process Bookings
    const rawBookings = Array.isArray(bookingsData?.bookings)
      ? bookingsData.bookings
      : Array.isArray(bookingsData)
        ? bookingsData
        : bookingsData && typeof bookingsData === "object" && Array.isArray((bookingsData as any).data)
          ? (bookingsData as any).data
          : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysBookings = rawBookings.filter((booking: any) => {
      if (!booking.bookingDate) return false;

      let date: Date | null = null;

      // Handle Firestore Timestamp
      if (typeof booking.bookingDate === 'object' && booking.bookingDate.seconds) {
        date = new Date(booking.bookingDate.seconds * 1000);
      }
      // Handle String Date
      else if (typeof booking.bookingDate === 'string') {
        date = new Date(booking.bookingDate);
      }

      if (!date || isNaN(date.getTime())) return false;

      // Check if same day
      const bookingDay = new Date(date);
      bookingDay.setHours(0, 0, 0, 0);

      return bookingDay.getTime() === today.getTime();
    });

    const todaysAppointmentsCount = todaysBookings.length;

    // Pending Tasks: Appointments today without vitals and not cancelled/completed
    const pendingTasksCount = todaysBookings.filter((booking: any) => {
      const status = booking.bookingStatus?.toLowerCase() || "pending";
      const hasVitals = !!booking.vital_signs;
      const isCompleted = status === "completed" || status === "cancelled" || status === "rejected";

      return !hasVitals && !isCompleted;
    }).length;

    // Critical Alerts: Urgent/Emergency in reason or comments
    const criticalAlertsCount = todaysBookings.filter((booking: any) => {
      const reason = booking.reason?.toLowerCase() || "";
      const comments = Array.isArray(booking.comments)
        ? booking.comments.join(" ").toLowerCase()
        : (booking.comments || "").toString().toLowerCase();

      return reason.includes("urgent") ||
        reason.includes("emergency") ||
        comments.includes("urgent") ||
        comments.includes("emergency");
    }).length;

    return {
      totalPatients,
      todaysAppointmentsCount,
      pendingTasksCount,
      criticalAlertsCount
    };
  }, [bookingsData, patientsData]);

  const statsData = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Active patients"
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointmentsCount.toString(),
      icon: Calendar,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today"
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasksCount.toString(),
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting completion"
    },
    {
      title: "Critical Alerts",
      value: stats.criticalAlertsCount.toString(),
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "Require attention"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

            {/* Content */}
            <div className="relative p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`} />
                </div>

              </div>

              <div className="mb-1 md:mb-2">
                <h2 className="text-[16px] md:text-[18px] md:text-[18px] md:text-[20px] font-bold text-gray-900 mb-0.5 md:mb-1">
                  {stat.value}
                </h2>
                <h3 className="text-xs md: !text-[10px]  !md:text-[12px] font-semibold text-gray-700 mb-0.5 md:mb-1">
                  {stat.title}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NurseStatsCards;
