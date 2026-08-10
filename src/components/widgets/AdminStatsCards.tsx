"use client";

import React from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { useGetUsersQuery } from "@/store/authApi";
import { useGetBookingsQuery } from "@/store/bookingApi";
import { useGetPaymentsQuery } from "@/store/paymentApi";

const AdminStatsCards: React.FC = () => {
  // Fetch data from admin pages
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetBookingsQuery({});
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({ limit: 100 });

  // Ensure data is always an array with proper validation
  let users: unknown[] = [];
  let bookings: unknown[] = [];
  let payments: unknown[] = [];

  // Handle users data
  if (Array.isArray(usersData)) {
    users = usersData;
  } else if (
    usersData &&
    typeof usersData === "object" &&
    "users" in usersData &&
    Array.isArray((usersData as { users: unknown }).users)
  ) {
    users = (usersData as { users: unknown[] }).users;
  } else if (
    usersData &&
    typeof usersData === "object" &&
    "data" in usersData &&
    Array.isArray((usersData as { data: unknown }).data)
  ) {
    users = (usersData as { data: unknown[] }).data;
  }

  // Handle bookings data
  if (Array.isArray(bookingsData?.bookings)) {
    bookings = bookingsData.bookings;
  } else if (Array.isArray(bookingsData)) {
    bookings = bookingsData;
  } else if (
    bookingsData &&
    typeof bookingsData === "object" &&
    "data" in bookingsData &&
    Array.isArray((bookingsData as { data: unknown }).data)
  ) {
    bookings = (bookingsData as { data: unknown[] }).data;
  }

  // Handle payments data
  if (Array.isArray(paymentsData)) {
    payments = paymentsData;
  } else if (
    paymentsData &&
    typeof paymentsData === "object" &&
    "data" in paymentsData &&
    Array.isArray((paymentsData as { data: unknown }).data)
  ) {
    payments = (paymentsData as { data: unknown[] }).data;
  }

  // Calculate statistics
  const totalUsers = users.length;
  const totalDoctors = users.filter(
    (user) => (user as { role: string }).role === "doctor"
  ).length;
  const totalNurses = users.filter(
    (user) => (user as { role: string }).role === "nurse"
  ).length;
  const totalPatients = users.filter(
    (user) => (user as { role: string }).role === "patient"
  ).length;
  const totalBookings = bookings.length;

  // Payments store the fee as a string like "10,000" and their state in
  // `paymentStatus` (values "completed"/"success"). The old code summed
  // `payment.amount` as a number and filtered on `payment.status`, so nothing
  // matched → ₦0.00. Parse the amount and read the right status field.
  const parseAmount = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (!v) return 0;
    return parseFloat(String(v).replace(/[^\d.]/g, "")) || 0;
  };
  const isPaid = (payment: Record<string, unknown>) => {
    const s = String(payment.paymentStatus ?? payment.status ?? "").toLowerCase();
    return s === "completed" || s === "success" || s === "paid";
  };
  const totalRevenue = payments
    .filter((payment) => isPaid(payment as Record<string, unknown>))
    .reduce((sum: number, payment) => {
      const p = payment as Record<string, unknown>;
      return sum + parseAmount(p.amount ?? p.pricing ?? p.consultationFee);
    }, 0);

  const statsData = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All registered users",
    },
    {
      title: "Total Doctors",
      value: totalDoctors,
      icon: Stethoscope,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Verified doctors"
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "All appointments"
    },
    {
      title: "Total Revenue",
      value: `₦ ${totalRevenue.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "From completed payments"
    }
  ];

  if (usersLoading || bookingsLoading || paymentsLoading) {
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
            <Users className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">System Overview</h3>
            <p className="text-xs md: text-[10px]  md:text-[12px] text-gray-500">Key metrics and statistics</p>
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
                  <h2 className="text-[16px] md:text-[18px] font-bold text-gray-900 mb-0.5 md:mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-xs md: text-[10px]  md:text-[12px] font-semibold text-gray-700 mb-0.5 md:mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4  text-[10px]  md:text-[12px]">
          <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">
            System Status: All Systems Operational
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Active Users: {totalUsers}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Doctors: {totalDoctors}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Bookings: {totalBookings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;
