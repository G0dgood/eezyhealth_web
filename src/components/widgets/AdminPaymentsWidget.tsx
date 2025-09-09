"use client";

import React from "react";
import {
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MoreVertical,
} from "lucide-react";
import { useGetPaymentsQuery } from "@/store/api";
import Link from "next/link";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  patientId?: string;
  doctorId?: string;
  bookingId?: string;
  description?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminPaymentsWidget: React.FC = () => {
  // Fetch payments data from admin payment page
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });

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

  // Get recent payments (last 5)
  const recentPayments = [...payments]
    .sort((a, b) => {
      const dateA = new Date(
        (a as { createdAt?: string }).createdAt || 0
      ).getTime();
      const dateB = new Date(
        (b as { createdAt?: string }).createdAt || 0
      ).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Calculate payment statistics
  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    (payment) => (payment as { status?: string }).status === "completed"
  ).length;
  const pendingPayments = payments.filter(
    (payment) => (payment as { status?: string }).status === "pending"
  ).length;
  const failedPayments = payments.filter(
    (payment) => (payment as { status?: string }).status === "failed"
  ).length;

  // Calculate total revenue
  const totalRevenue = payments
    .filter(
      (payment) => (payment as { status?: string }).status === "completed"
    )
    .reduce((sum: number, payment) => {
      const amount =
        typeof (payment as { amount?: number }).amount === "number"
          ? (payment as { amount?: number }).amount
          : 0;
      return sum + (amount || 0);
    }, 0);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStringFormatted = date.toISOString().split("T")[0];
    const todayString = today.toISOString().split("T")[0];
    const tomorrowString = tomorrow.toISOString().split("T")[0];

    if (dateStringFormatted === todayString) return "Today";
    if (dateStringFormatted === tomorrowString) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
      case "failed":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
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

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Error loading payments. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (recentPayments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Payment Records
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            No payment records found yet. Payments will appear here once
            patients complete their transactions.
          </p>
          <Link
            href="/admin/payment"
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-sm font-medium">
            View All Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Payments</h3>
            <p className="text-sm text-gray-500">Latest payment transactions</p>
          </div>
        </div>
        <Link
          href="/admin/payment"
          className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {totalPayments}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {completedPayments}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {pendingPayments}
          </div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {failedPayments}
          </div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-600">₦</span>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Total Revenue
              </h4>
              <p className="text-sm text-gray-600">From completed payments</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₦{totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              +18% this month
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-4">
        {recentPayments.map((payment) => (
          <div
            key={(payment as { id?: string }).id || Math.random().toString()}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="text-green-600" size={16} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {typeof (payment as { description?: string })
                      .description === "string"
                      ? (payment as { description?: string }).description
                      : "Payment Transaction"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {typeof (payment as { paymentMethod?: string })
                      .paymentMethod === "string"
                      ? (payment as { paymentMethod?: string }).paymentMethod
                      : "Payment Method"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    (payment as { status?: string }).status || "unknown"
                  )}`}>
                  {typeof (payment as { status?: string }).status === "string"
                    ? (payment as { status?: string }).status
                    : "Unknown"}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>
                  {formatDate((payment as { createdAt?: string }).createdAt)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Amount: </span>
                <span className="font-semibold text-green-600">
                  ₦
                  {typeof (payment as { amount?: number }).amount === "number"
                    ? (payment as { amount?: number }).amount!.toFixed(2)
                    : "0.00"}{" "}
                  {typeof (payment as { currency?: string }).currency ===
                  "string"
                    ? (payment as { currency?: string }).currency
                    : "USD"}
                </span>
              </div>
              {(payment as { transactionId?: string }).transactionId &&
                typeof (payment as { transactionId?: string }).transactionId ===
                  "string" && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Transaction ID: </span>
                    <span className="font-mono text-xs">
                      {(payment as { transactionId?: string }).transactionId}
                    </span>
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {getStatusIcon(
                  typeof (payment as { status?: string }).status === "string"
                    ? (payment as { status?: string }).status
                    : "unknown"
                )}
                <span>
                  {typeof (payment as { status?: string }).status === "string"
                    ? (payment as { status?: string }).status
                    : "Unknown"}
                </span>
              </div>
              <Link
                href="/admin/payment"
                className="text-blue-600 text-xs font-medium hover:text-blue-700">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Payments: {totalPayments}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                Completed: {completedPayments}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">Pending: {pendingPayments}</span>
            </div>
            {failedPayments > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">Failed: {failedPayments}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsWidget;
