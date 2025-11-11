"use client";

import React from "react";
import { CreditCard, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetPaymentsByDoctorIdQuery } from "@/store/api";

const PaymentWidget: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.uid ?? "";

  const {
    data: paymentsData,
    isLoading,
    isFetching,
    error,
  } = useGetPaymentsByDoctorIdQuery(
    { doctorId },
    { skip: !doctorId }
  );

  const payments = Array.isArray(paymentsData)
    ? paymentsData
    : Array.isArray((paymentsData as { data?: unknown[] })?.data)
    ? ((paymentsData as { data?: unknown[] }).data as unknown[])
    : [];

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const toDate = (value: unknown): Date | null => {
    if (!value) return null;
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (
      typeof value === "object" &&
      value !== null &&
      ("seconds" in (value as { seconds?: number }) ||
        "_seconds" in (value as { _seconds?: number }))
    ) {
      const seconds = (value as { seconds?: number }).seconds;
      if (typeof seconds === "number") return new Date(seconds * 1000);
      const altSeconds = (value as { _seconds?: number })._seconds;
      if (typeof altSeconds === "number") return new Date(altSeconds * 1000);
    }
    return null;
  };

  const normalizedPayments = payments
    .map((payment) => {
      const record = payment as Record<string, unknown>;
      const createdTime =
        toDate(record.createdTime) ??
        toDate(record.createdAt) ??
        toDate(record.updatedAt);

      return {
        id: String(record.id ?? ""),
        amount: toNumber(record.amount),
        status: String(record.status ?? "pending").toLowerCase(),
        paymentMethod: String(record.payment_method ?? record.paymentMethod ?? "Card Payment"),
        patientName: String(record.patient_name ?? record.patientName ?? "Unknown Patient"),
        createdTime,
      };
    })
    .filter((payment) => payment.id);

  const recentPayments = [...normalizedPayments]
    .sort((a, b) => {
      const timeA = a.createdTime?.getTime() ?? 0;
      const timeB = b.createdTime?.getTime() ?? 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  const totalRevenue = normalizedPayments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedPayments = normalizedPayments.filter(
    (payment) => payment.status === "completed"
  ).length;

  const pendingPayments = normalizedPayments.filter(
    (payment) => payment.status === "pending"
  ).length;

  const now = new Date();
  const thisMonthRevenue = normalizedPayments
    .filter((payment) => {
      if (!payment.createdTime) return false;
      return (
        payment.createdTime.getMonth() === now.getMonth() &&
        payment.createdTime.getFullYear() === now.getFullYear() &&
        payment.status === "completed"
      );
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  const formatDate = (dateInput: Date | string | undefined) => {
    if (!dateInput) return "N/A";
    const date =
      dateInput instanceof Date ? dateInput : new Date(dateInput as string);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} className="text-green-600" />;
      case "pending":
        return <Clock size={14} className="text-yellow-600" />;
      case "failed":
        return <Clock size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  if (!doctorId) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <CreditCard className="text-gray-300 mb-3" size={36} />
          <p className="text-sm text-gray-500 text-center">
            Sign in as a doctor to view payment insights.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
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
        Failed to load payments. Please try again later.
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
            No Payments Found
          </h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            No payment records found for your practice yet.
          </p>
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
            <h3 className="text-xl font-bold text-gray-900">Payment Overview</h3>
            <p className="text-sm text-gray-500">Your practice earnings</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ₦{totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            ₦{thisMonthRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">This Month</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{completedPayments}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-4">
        {recentPayments.map((payment) => (
          <div
            key={payment.id}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    ₦{payment.amount.toFixed(2)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {payment.patientName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    payment.status
                  )}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
                {getStatusIcon(payment.status)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">💳</span>
                <span>{payment.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">📅</span>
                <span>{formatDate(payment.createdTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CreditCard size={14} />
                <span>
                  Payment ID: {payment.id ? `${payment.id.slice(0, 8)}...` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Pending Payments: {pendingPayments}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Completed: {completedPayments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600">Pending: {pendingPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentWidget;