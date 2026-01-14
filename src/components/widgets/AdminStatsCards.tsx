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
    (user) => (user as { role: string }).role === "DOCTOR"
  ).length;
  const totalNurses = users.filter(
    (user) => (user as { role: string }).role === "NURSE"
  ).length;
  const totalPatients = users.filter(
    (user) => (user as { role: string }).role === "PATIENT"
  ).length;
  const totalBookings = bookings.length;
  const totalRevenue = payments
    .filter((payment) => (payment as { status: string }).status === "completed")
    .reduce(
      (sum: number, payment) =>
        sum + ((payment as { amount?: number }).amount || 0),
      0
    );

  const statsData = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All registered users",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Doctors",
      value: totalDoctors,
      icon: Stethoscope,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Verified doctors",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: Calendar,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "All appointments",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `₦ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "From completed payments",
      trend: "+18%",
      trendUp: true,
    },
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#44CE2D] to-green-600 rounded-xl flex items-center justify-center">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
            <p className="text-sm text-gray-500">Key metrics and statistics</p>
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
            System Status: All Systems Operational
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Active Users: {totalUsers}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">Doctors: {totalDoctors}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600">Bookings: {totalBookings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;
