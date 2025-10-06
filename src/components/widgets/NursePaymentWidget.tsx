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
import { useGetPaymentsQuery } from "@/store/api";

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

  // Calculate payment statistics
  const totalRevenue = (payments || [])
    .filter((payment: any) => payment?.paymentStatus === "completed" || payment?.status === "success")
    .reduce((sum: number, payment: any) => sum + (Number(payment?.amount) || 0), 0);

  const completedPayments = (payments || [])
    .filter((payment: any) => payment?.paymentStatus === "completed" || payment?.status === "success")
    .length;

  const pendingPayments = (payments || [])
    .filter((payment: any) => payment?.paymentStatus === "pending" || payment?.status === "pending")
    .length;

<<<<<<< HEAD
  const todayPayments = payments.filter((payment: any) => {
    if (!payment.createdTime) return false;
    const paymentDate = new Date(payment.createdTime);
    const today = new Date();
    return (
      paymentDate.toDateString() === today.toDateString() &&
      payment.status === "completed"
    );
  }).length;
=======
  const todayPayments = (payments || [])
    .filter((payment: any) => {
      const paymentDate = payment?.createdAt || payment?.paymentDate;
      if (!paymentDate) return false;
      const date = new Date(paymentDate);
      const today = new Date();
      return date.toDateString() === today.toDateString() && (payment.paymentStatus === "completed" || payment?.status === "success");
    })
    .length;
>>>>>>> 89f0a139df38701f1880c1b66937c5ae24dbf593

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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Payment Overview
            </h3>
            <p className="text-sm text-gray-500">Clinic payment status</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ₦{totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
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
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {todayPayments}
          </div>
          <div className="text-xs text-gray-600">Today</div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-4">
        {recentPayments?.map((payment: any) => (
          <div
<<<<<<< HEAD
            key={payment.id}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
=======
            key={payment?.id}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
>>>>>>> 89f0a139df38701f1880c1b66937c5ae24dbf593
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
<<<<<<< HEAD
                    ₦{payment?.amount?.toFixed(2) || "0.00"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {payment?.patient_name || "Unknown Patient"}
=======
                    ₦{(typeof payment?.amount === 'number' ? payment?.amount : parseFloat(payment?.amount) || 0).toFixed(2)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {payment?.patientName || payment?.patient_name || "Unknown Patient"}
>>>>>>> 89f0a139df38701f1880c1b66937c5ae24dbf593
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
<<<<<<< HEAD
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {payment.status}
=======
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment)}`}>
                  {getStatusText(payment)}
>>>>>>> 89f0a139df38701f1880c1b66937c5ae24dbf593
                </span>
                {getStatusIcon(payment)}
              </div>
            </div>

            <div className="space-y-2">
              {payment?.doctor_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">👨‍⚕️</span>
                  <span>{payment?.doctor_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">💳</span>
                <span>{payment?.paymentMethod || payment?.payment_method || "Card Payment"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-xs">📅</span>
                <span>{formatDate(payment?.createdAt || payment?.paymentDate || payment?.createdTime)}</span>
              </div>
              {payment?.bookingDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs">📋</span>
                  <span>Appointment: {formatDate(payment?.bookingDate)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CreditCard size={14} />
                <span>Ref: {payment?.paymentReference?.reference || payment?.transactionId?.reference || payment?.id?.slice(0, 8) || "N/A"}...</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={12} />
                <span>{payment?.currency || "NGN"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Clinic Revenue: ₦{totalRevenue.toFixed(2)}
          </span>
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
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600">Today: {todayPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursePaymentWidget;
