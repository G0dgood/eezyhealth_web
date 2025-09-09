"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react";
import { useGetBookingCancellationsByDoctorIdQuery } from "@/store/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { getCancellationStatusBadge } from "@/components/Options";

interface CancellationRequest {
  id: string;
  patientName: string;
  patientId?: string;
  userId?: string;
  doctorId: string;
  doctorName?: string;
  bookingDate: string | { seconds: number; nanoseconds: number }; // Firebase timestamp
  slot: string;
  timeSlot?: string; // fallback
  bookingChannel?: string;
  bookingStatus?: string;
  bookingId?: string;
  cancellationRequest: {
    reasonForCancellation?: string;
    reason?: string; // fallback
    status: string;
    adminResponse?: string;
    respondedAt?: string | { seconds: number; nanoseconds: number }; // Firebase timestamp
    respondedBy?: string;
  };
  status: string;
  paymentStatus?: string;
  specialization?: string;
  hospital?: string;
  patientAddress?: string;
  doctorPhotoUrl?: string;
  photo_url?: string;
  comments?: unknown[];
}

const BookingCancellationWidget: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.uid;

  // Fetch cancellation requests using RTK Query
  const {
    data: cancellationsData,
    isLoading,
    error,
  } = useGetBookingCancellationsByDoctorIdQuery(
    { doctorId: doctorId || "" },
    {
      skip: !doctorId,
    }
  );

  const cancellations: CancellationRequest[] =
    (cancellationsData as unknown as CancellationRequest[]) || [];

  // Debug logging
  console.log("BookingCancellationWidget - doctorId:", doctorId);
  console.log("BookingCancellationWidget - isLoading:", isLoading);
  console.log("BookingCancellationWidget - error:", error);
  console.log(
    "BookingCancellationWidget - cancellationsData:",
    cancellationsData
  );
  console.log("BookingCancellationWidget - cancellations:", cancellations);
  console.log(
    "BookingCancellationWidget - cancellations length:",
    cancellations.length
  );

  // Calculate statistics from cancellation data
  const totalCancellations = cancellations.length;
  const pendingCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.cancellationRequest?.status?.toLowerCase() === "pending"
  ).length;

  const approvedCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.cancellationRequest?.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.cancellationRequest?.status?.toLowerCase() === "rejected" ||
      cancellation.cancellationRequest?.status?.toLowerCase() === "denied"
  ).length;

  // Get recent cancellations (last 5)
  const recentCancellations = [...cancellations]
    .sort((a: CancellationRequest, b: CancellationRequest) => {
      const dateA =
        typeof a.bookingDate === "string"
          ? new Date(a.bookingDate).getTime()
          : typeof a.bookingDate === "object" && "seconds" in a.bookingDate
          ? a.bookingDate.seconds * 1000
          : new Date(a.bookingDate as string).getTime();
      const dateB =
        typeof b.bookingDate === "string"
          ? new Date(b.bookingDate).getTime()
          : typeof b.bookingDate === "object" && "seconds" in b.bookingDate
          ? b.bookingDate.seconds * 1000
          : new Date(b.bookingDate as string).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const hasData = totalCancellations > 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !cancellationsData) {
    console.log("BookingCancellationWidget error:", error);
    console.log("BookingCancellationWidget data:", cancellationsData);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Failed to load cancellation requests. Please try again later.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (!hasData && !isLoading) {
    console.log("BookingCancellationWidget - No data state:", {
      hasData,
      isLoading,
      cancellations,
    });
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 p-6">
        <div className="w-64 h-32 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <AlertTriangle className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          No Cancellation Requests!
        </h2>
        <p className="mb-4 text-center text-lg max-w-xl text-gray-500">
          No cancellation requests have been submitted yet.
          <br />
          All appointments are proceeding as scheduled!
        </p>
      </div>
    );
  }

  // Show data even if there's an error, as long as we have data
  if (error && cancellationsData && cancellationsData.length > 0) {
    console.log("BookingCancellationWidget - Showing data despite error:", {
      error,
      cancellationsData,
    });
  }

  const statsData = [
    {
      title: "Total Requests",
      value: totalCancellations,
      icon: AlertTriangle,
      gradient: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "All cancellation requests",
      trend: "+8%",
    },
    {
      title: "Pending",
      value: pendingCancellations,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Awaiting response",
      trend: "+12%",
    },
    {
      title: "Approved",
      value: approvedCancellations,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Cancellations approved",
      trend: "+15%",
    },
    {
      title: "Rejected",
      value: rejectedCancellations,
      icon: XCircle,
      gradient: "from-gray-500 to-slate-600",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      description: "Requests denied",
      trend: "+5%",
    },
  ];

  const formatDate = (
    bookingDate:
      | string
      | { seconds: number; nanoseconds: number }
      | { toDate: () => Date }
  ) => {
    const date =
      bookingDate && typeof bookingDate === "object" && "toDate" in bookingDate
        ? bookingDate.toDate()
        : new Date(bookingDate as string | number);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toISOString().split("T")[0];
    const todayString = today.toISOString().split("T")[0];
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    if (dateString === todayString) return "Today";
    if (dateString === tomorrowString) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Cancellation Requests
            </h3>
            <p className="text-sm text-gray-500">
              Patient cancellation requests and status
            </p>
          </div>
        </div>
        <Link
          href="/doctor/booking-cancellation"
          className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statsData.map((item, index) => {
          const IconComponent = item.icon;
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
                    <div className="text-xs font-medium flex items-center gap-1 text-green-600">
                      ↗ {item.trend}
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

      {/* Recent Cancellations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Recent Requests
          </h4>
          <span className="text-sm text-gray-500">
            {recentCancellations.length} requests
          </span>
        </div>

        {recentCancellations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No recent cancellation requests</p>
          </div>
        ) : (
          recentCancellations.map((cancellation: CancellationRequest) => (
            <div
              key={cancellation.id}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="text-red-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {cancellation.patientName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {cancellation.hospital || "Hospital"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getCancellationStatusBadge(
                    cancellation.cancellationRequest?.status ||
                      cancellation.status ||
                      "pending"
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate(cancellation.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{cancellation.slot || cancellation.timeSlot}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Reason: </span>
                  {cancellation.cancellationRequest?.reasonForCancellation ||
                    cancellation.cancellationRequest?.reason ||
                    "No reason provided"}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <AlertTriangle size={14} />
                  <span>
                    {cancellation.cancellationRequest?.status ||
                      cancellation.status ||
                      "pending"}
                  </span>
                </div>
                <Link
                  href="/doctor/booking-cancellation"
                  className="text-blue-600 text-xs font-medium hover:text-blue-700">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Requests: {totalCancellations}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">
                Pending: {pendingCancellations}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                Approved: {approvedCancellations}
              </span>
            </div>
            {rejectedCancellations > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="text-gray-600">
                  Rejected: {rejectedCancellations}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCancellationWidget;
