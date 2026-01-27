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
import {
  useGetBookingCancellationsQuery,
  useGetBookingCancellationsByDoctorIdQuery,
} from "@/store/bookingCancellationApi";
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
  cancellationRequest?: {
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
  const { user, userInfo } = useAuth();
  const doctorId = user?.uid;
  const normalizedRole = (typeof userInfo?.role === "string"
    ? userInfo?.role
    : ""
  ).toUpperCase();
  const isNurseOrAdmin =
    normalizedRole === "nurse" || normalizedRole === "admin";

  // Fetch cancellation requests using RTK Query based on user role
  // For nurses: use useGetBookingCancellationsQuery (all cancellations)
  // For doctors: use useGetBookingCancellationsByDoctorIdQuery (doctor-specific)
  const { data: allCancellationsData, isLoading: isLoadingAll, error: errorAll } =
    useGetBookingCancellationsQuery({}, { skip: !isNurseOrAdmin });

  const { data: doctorCancellationsData, isLoading: isLoadingDoctor, error: errorDoctor } =
    useGetBookingCancellationsByDoctorIdQuery(
      { doctorId: doctorId || "" },
      { skip: !doctorId || isNurseOrAdmin }
    );

  // Choose the appropriate data based on role
  const isLoading = isNurseOrAdmin ? isLoadingAll : isLoadingDoctor;
  const error = isNurseOrAdmin ? errorAll : errorDoctor;
  const cancellationsData = isNurseOrAdmin
    ? allCancellationsData
    : doctorCancellationsData;
  const viewAllHref =
    normalizedRole === "doctor"
      ? "/doctor/booking-cancellation"
      : "/nurse/booking-cancellation";

  const cancellations: CancellationRequest[] =
    (cancellationsData as unknown as CancellationRequest[]) || [];


  // Calculate statistics from cancellation data
  const totalCancellations = cancellations.length;
  const pendingCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.bookingStatus?.toLowerCase() === "pending"
  ).length;

  const approvedCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.bookingStatus?.toLowerCase() === "approved" ||
      cancellation.bookingStatus?.toLowerCase() === "cancelled"
  ).length;

  const rejectedCancellations = cancellations.filter(
    (cancellation: CancellationRequest) =>
      cancellation.bookingStatus?.toLowerCase() === "rejected" ||
      cancellation.bookingStatus?.toLowerCase() === "denied"
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
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
          Failed to load requests
        </h3>
        <p className="text-gray-500 text-center  !text-[10px]  !md:text-[12px] mb-4">
          We couldn't fetch the cancellation requests. Please check your connection and try again.
        </p>
        <div className="text-xs bg-gray-50 p-2 rounded text-gray-500 font-mono max-w-xs truncate">
          Error: {String(error)}
        </div>
      </div>
    );
  }

  if (!hasData && !isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 mb-6 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h2 className="text-[16px] md:text-[18px] md:text-[18px] md:text-[20px] font-bold mb-3 text-gray-900">
          No Cancellation Requests
        </h2>
        <p className="text-gray-500 text-center max-w-md  !text-[10px]  !md:text-[12px] md:text-base leading-relaxed">
          Great news! There are no pending cancellation requests at the moment.
          <br className="hidden md:block" />
          All scheduled appointments are proceeding as planned.
        </p>
      </div>
    );
  }

  // Show data even if there's an error, as long as we have data
  if (error && cancellationsData && cancellationsData.length > 0) {

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
    },
    {
      title: "Pending",
      value: pendingCancellations,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Awaiting response"
    },
    {
      title: "Approved",
      value: approvedCancellations,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Cancellations approved"
    },
    {
      title: "Rejected",
      value: rejectedCancellations,
      icon: XCircle,
      gradient: "from-gray-500 to-slate-600",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      description: "Requests denied"
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">
              Cancellation Requests
            </h3>
            <p className="text-xs md: !text-[10px]  !md:text-[12px] text-gray-500">
              Patient cancellation requests and status
            </p>
          </div>
        </div>
        <Link
          href={viewAllHref}
          className="text-blue-600 text-xs md: !text-[10px]  !md:text-[12px] font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
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
                  <p className="text-[10px] md:text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Cancellations */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base md:text-[14px] md:text-[16px] font-semibold text-gray-900">
            Recent Requests
          </h4>
          <span className="text-xs md: !text-[10px]  !md:text-[12px] text-gray-500">
            {recentCancellations.length} requests
          </span>
        </div>

        {recentCancellations.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <CheckCircle className="mx-auto mb-2 text-green-300" size={24} />
            <p className=" !text-[10px]  !md:text-[12px]">No recent cancellation requests</p>
          </div>
        ) : (
          recentCancellations.map((cancellation: CancellationRequest) => (
            <div
              key={cancellation.id}
              className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 md:mb-3 gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-red-600" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium  !text-[10px]  !md:text-[12px] md:text-base text-gray-900 truncate">
                      {cancellation.patientName}
                    </h4>
                    <p className="text-xs md: !text-[10px]  !md:text-[12px] text-gray-600 truncate">
                      {cancellation.hospital || "Hospital"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto ml-0 sm:ml-2">
                  {getCancellationStatusBadge(
                    cancellation.cancellationRequest?.status ||
                    cancellation.status ||
                    "pending"
                  )}
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <div className="flex items-center gap-2 text-xs md: !text-[10px]  !md:text-[12px] text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate(cancellation.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md: !text-[10px]  !md:text-[12px] text-gray-600">
                  <Clock size={14} />
                  <span>{cancellation.slot || cancellation.timeSlot}</span>
                </div>
                <div className="text-xs md: !text-[10px]  !md:text-[12px] text-gray-600">
                  <span className="font-medium">Reason: </span>
                  <span className="line-clamp-1 inline-block align-bottom">
                    {cancellation.cancellationRequest?.reasonForCancellation ||
                      cancellation.cancellationRequest?.reason ||
                      "No reason provided"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-600">
                  <AlertTriangle size={12} className="md:w-3.5 md:h-3.5" />
                  <span>
                    {cancellation.cancellationRequest?.status ||
                      cancellation.status ||
                      "pending"}
                  </span>
                </div>
                <Link
                  href={viewAllHref}
                  className="text-blue-600 text-[10px] md:text-xs font-medium hover:text-blue-700">
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4  !text-[10px]  !md:text-[12px]">
          <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">
            Total Requests: {totalCancellations}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">
                Pending: {pendingCancellations}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">
                Approved: {approvedCancellations}
              </span>
            </div>
            {rejectedCancellations > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="text-gray-600 text-xs md: !text-[10px]  !md:text-[12px]">
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
