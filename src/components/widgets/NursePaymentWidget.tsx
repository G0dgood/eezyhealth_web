"use client";

import React from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { useGetPaymentsQuery } from "@/store/paymentApi";

const NursePaymentWidget: React.FC = () => {
  // Fetch payments data
  const { data: paymentsData, isLoading } = useGetPaymentsQuery({ limit: 100 });

  // Ensure payments is always an array
  let payments: unknown[] = [];
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

  // Get recent payments (last 5) - nurses can view all payments for transparency
  const recentPayments = [...payments]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.paymentDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.paymentDate || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Helper to parse amount string "10,000" -> 10000
  const parseAmount = (amountStr: string | number | undefined) => {
    if (typeof amountStr === 'number') return amountStr;
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/,/g, ''));
  };

  // Calculate payment statistics
  const totalRevenue = (payments || [])
    .filter(
      (payment: any) =>
        payment?.paymentStatus === "completed" || payment?.status === "success"
    )
    .reduce(
      (sum: number, payment: any) => sum + parseAmount(payment?.amount),
      0
    );

  const completedPayments = (payments || []).filter(
    (payment: any) =>
      payment?.paymentStatus === "completed" || payment?.status === "success"
  ).length;

  const pendingPayments = (payments || []).filter(
    (payment: any) =>
      payment?.paymentStatus === "pending" || payment?.status === "pending"
  ).length;

  const todayPayments = (payments || []).filter((payment: any) => {
    const paymentDate = payment?.createdAt || payment?.paymentDate;
    if (!paymentDate) return false;
    const date = new Date(paymentDate);
    const today = new Date();
    return (
      date.toDateString() === today.toDateString() &&
      (payment.paymentStatus === "completed" || payment?.status === "success")
    );
  }).length;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (payment: any) => {
    const status = payment?.paymentStatus || payment?.status;
    switch (status) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (payment: any) => {
    const status = payment?.paymentStatus || payment?.status;
    switch (status) {
      case "completed":
      case "success":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "failed":
        return <Clock size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const getStatusText = (payment: any) => {
    const status = payment?.paymentStatus || payment?.status;
    switch (status) {
      case "completed":
      case "success":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status || "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recentPayments?.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Payments Found
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            No payment records found yet. Payments will appear here once they
            are processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Payment Overview
            </h3>
            <p className="text-xs md:text-sm text-gray-500">Clinic payment status</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-green-600">
            ₦{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-blue-600">
            {completedPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-yellow-600">
            {pendingPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
          <div className="text-lg md:text-2xl font-bold text-purple-600">
            {todayPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Today</div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-3 md:space-y-4">
        {recentPayments?.map((payment: any) => (
          <div
            key={payment?.id}
            className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm md:text-base text-gray-900 truncate">
                    ₦{parseAmount(payment?.amount).toFixed(2)}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {payment?.patientName ||
                      payment?.patient_name ||
                      "Unknown Patient"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getStatusColor(
                    payment
                  )}`}
                >
                  {getStatusText(payment)}
                </span>
                {getStatusIcon(payment)}
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              {payment?.doctor_name && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span className="text-[10px] md:text-xs">👨‍⚕️</span>
                  <span>{payment?.doctor_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <span className="text-[10px] md:text-xs">💳</span>
                <span>
                  {payment?.paymentMethod ||
                    payment?.payment_method ||
                    "Card Payment"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <span className="text-[10px] md:text-xs">📅</span>
                <span>
                  {formatDate(
                    payment?.createdAt ||
                      payment?.paymentDate ||
                      payment?.createdTime
                  )}
                </span>
              </div>
              {payment?.bookingDate && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span className="text-[10px] md:text-xs">📋</span>
                  <span>Appointment: {formatDate(payment?.bookingDate)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-600">
                <CreditCard size={14} />
                <span>
                  Ref:{" "}
                  {payment?.paymentReference?.reference ||
                    payment?.transactionId?.reference ||
                    payment?.id?.slice(0, 8) ||
                    "N/A"}
                  ...
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500">
                <Users size={12} />
                <span>{payment?.currency || "NGN"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
          <span className="text-gray-600 text-xs md:text-sm">
            Clinic Revenue: ₦{totalRevenue.toFixed(2)}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">
                Completed: {completedPayments}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Pending: {pendingPayments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md:text-sm">Today: {todayPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursePaymentWidget;
