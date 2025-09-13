"use client";

import React from "react";
import { Edit } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import Title from "@/components/Title";
import {
  AdminStatsCards,
  AdminBookingsWidget,
  AdminUsersWidget,
  AdminPaymentsWidget,
  AdminCalendarWidget,
} from "@/components/widgets";

export default function AdminDashboardPage() {
  const userInfo = useUserInfo();
  const isLoading = !userInfo;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-[calc(100vh-200px)]">
            <div className="col-span-4 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded" />
              ))}
            </div>
            <div className="col-span-2">
              <div className="h-full bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 p-6">
        <div className="w-64 h-32 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-4xl">👤</div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Access Denied</h2>
        <p className="mb-4 text-center text-lg max-w-xl text-gray-500">
          You need to be logged in to access the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-[calc(100vh-200px)]">
        <div className="col-span-4 rounded min-h-[400px] overflow-y-auto border border-gray-200">
          <div className="space-y-6 p-4">
            {/* Admin Stats Cards Widget */}
            <AdminStatsCards />

            {/* Admin Bookings Widget */}
            <AdminBookingsWidget />

            {/* Admin Users Widget */}
            <AdminUsersWidget />

            {/* Admin Payments Widget */}
            <AdminPaymentsWidget />
          </div>
        </div>

        <div className="col-span-2 rounded min-h-[400px] overflow-y-auto border border-gray-200">
          <div className="space-y-6 p-4">
            {/* Admin Calendar Widget */}
            <AdminCalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
