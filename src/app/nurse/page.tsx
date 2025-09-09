"use client";

import React from "react";
import { Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Title from "@/components/Title";
import { NoRecordFound } from "@/components/Options";
import NurseBookingsWidget from "@/components/widgets/NurseBookingsWidget";
import NurseStatsCards from "@/components/widgets/NurseStatsCards";
import NurseCalendarWidget from "@/components/widgets/NurseCalendarWidget";
import BookingCancellationWidget from "@/components/widgets/BookingCancellationWidget";
import NursePaymentWidget from "@/components/widgets/NursePaymentWidget";
import AvailabilityWidget from "@/components/widgets/AvailabilityWidget";

export default function NurseDashboardPage() {
  const { user, userInfo } = useAuth();

  // Show NoRecordFound if there is no user
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <NoRecordFound colSpan={1} />
      </div>
    );
  }

  // Show loading skeleton when user data is loading
  const isDashboardLoading = !userInfo?.first_name;

  if (isDashboardLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-[calc(100vh-200px)]">
          <div className="col-span-4 border border-gray-200 rounded min-h-[400px] overflow-y-auto">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border border-gray-200 bg-white">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 border border-gray-200 rounded min-h-[400px] overflow-y-auto">
            <div className="space-y-4 p-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border border-gray-200 bg-white">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title
          title={`Welcome Nurse ${
            userInfo?.first_name || userInfo?.display_name || "Nurse"
          }`}
        />
        <button
          className="rounded bg-white flex items-center justify-center p-2 hover:bg-gray-50 transition-colors"
          aria-label="Edit dashboard layout"
          title="Edit dashboard layout">
          <Edit size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-[calc(100vh-200px)]">
        <div className="col-span-4 rounded min-h-[400px] overflow-y-auto border border-gray-200">
          <div className="space-y-6 p-4">
            {/* Nurse Bookings Widget */}
            <NurseBookingsWidget />

            {/* Nurse Stats Cards Widget */}
            <NurseStatsCards />

            {/* Booking Cancellation Widget */}
            <BookingCancellationWidget />

            {/* Nurse Payment Widget */}
            <NursePaymentWidget />

            {/* Availability Widget */}
            <AvailabilityWidget />
          </div>
        </div>

        <div className="col-span-2 rounded min-h-[400px] overflow-y-auto border border-gray-200">
          <div className="space-y-6 p-4">
            {/* Nurse Calendar Widget */}
            <NurseCalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
