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
} from "lucide-react";
import { useGetPaymentsByDoctorIdQuery } from "@/store/api";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorPayment } from "@/types";
import Link from "next/link";

const PaymentWidget: React.FC = () => {
  const { user } = useAuth();
  const doctorId = user?.uid;

  // Fetch payments using RTK Query
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetPaymentsByDoctorIdQuery(
    { doctorId: doctorId || "" },
    {
      skip: !doctorId,
    }
  );

  const payments: DoctorPayment[] =
    (paymentsData as unknown as DoctorPayment[]) || [];

  // Debug logging
  console.log("PaymentWidget - doctorId:", doctorId);
  console.log("PaymentWidget - isLoading:", isLoading);
  console.log("PaymentWidget - error:", error);
  console.log("PaymentWidget - paymentsData:", paymentsData);
  console.log("PaymentWidget - payments:", payments);
  console.log("PaymentWidget - payments length:", payments.length);

  // Calculate statistics from payment data
  const totalPayments = payments.length;
  const completedPayments = payments.filter(
    (payment: DoctorPayment) =>
      payment.paymentStatus?.toLowerCase() === "completed" ||
      payment.paymentStatus?.toLowerCase() === "success"
  ).length;

  const pendingPayments = payments.filter(
    (payment: DoctorPayment) =>
      payment.paymentStatus?.toLowerCase() === "pending" ||
      payment.paymentStatus?.toLowerCase() === "processing"
  ).length;

  const failedPayments = payments.filter(
    (payment: DoctorPayment) =>
      payment.paymentStatus?.toLowerCase() === "failed" ||
      payment.paymentStatus?.toLowerCase() === "error"
  ).length;

  // Calculate total revenue
  const totalRevenue = payments
    .filter(
      (payment: DoctorPayment) =>
        payment.paymentStatus?.toLowerCase() === "completed" ||
        payment.paymentStatus?.toLowerCase() === "success"
    )
    .reduce((sum: number, payment: DoctorPayment) => sum + payment.amount, 0);

  // Get recent payments (last 5)
  const recentPayments = [...payments]
    .sort((a: DoctorPayment, b: DoctorPayment) => {
      const dateA = new Date(a.paymentDate || a.createdAt).getTime();
      const dateB = new Date(b.paymentDate || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const hasData = totalPayments > 0;

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

  if (error && !paymentsData) {
    console.log("PaymentWidget error:", error);
    console.log("PaymentWidget data:", paymentsData);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Error loading payments. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (!hasData && !isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96 p-6">
        <div className="w-64 h-32 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <CreditCard className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          No Payment Records!
        </h2>
        <p className="mb-4 text-center text-lg max-w-xl text-gray-500">
          No payment records found yet.
          <br />
          Payments will appear here once patients complete their transactions!
        </p>
      </div>
    );
  }

  // Show data even if there's an error, as long as we have data
  if (error && paymentsData && paymentsData.length > 0) {
    console.log("PaymentWidget - Showing data despite error:", {
      error,
      paymentsData,
    });
  }

  const statsData = [
    {
      title: "Total Payments",
      value: totalPayments,
      icon: CreditCard,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All transactions",
      trend: "+12%",
    },
    {
      title: "Completed",
      value: completedPayments,
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Successful payments",
      trend: "+15%",
    },
    {
      title: "Pending",
      value: pendingPayments,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Processing payments",
      trend: "+8%",
    },
    {
      title: "Failed",
      value: failedPayments,
      icon: AlertCircle,
      gradient: "from-red-500 to-pink-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "Failed transactions",
      trend: "-5%",
    },
  ];

  const formatDate = (dateString: string) => {
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

  const formatTime = (slot: string) => {
    // Convert slot to readable time format
    const timeSlotMap: Record<string, string> = {
      midnight_12am: "12:00 AM",
      early_morning_1am: "1:00 AM",
      early_morning_2am: "2:00 AM",
      early_morning_3am: "3:00 AM",
      early_morning_4am: "4:00 AM",
      early_morning_5am: "5:00 AM",
      morning_6am: "6:00 AM",
      morning_7am: "7:00 AM",
      morning_8am: "8:00 AM",
      morning_9am: "9:00 AM",
      morning_10am: "10:00 AM",
      morning_11am: "11:00 AM",
      afternoon_12pm: "12:00 PM",
      afternoon_1pm: "1:00 PM",
      afternoon_2pm: "2:00 PM",
      afternoon_3pm: "3:00 PM",
      afternoon_4pm: "4:00 PM",
      evening_5pm: "5:00 PM",
      evening_6pm: "6:00 PM",
      evening_7pm: "7:00 PM",
      evening_8pm: "8:00 PM",
      night_9pm: "9:00 PM",
      night_10pm: "10:00 PM",
      night_11pm: "11:00 PM",
    };

    return timeSlotMap[slot] || slot;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle size={14} />;
      case "pending":
      case "processing":
        return <Clock size={14} />;
      case "failed":
      case "error":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CreditCard className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-500">
              Patient payments and transaction records
            </p>
          </div>
        </div>
        <Link
          href="/doctor/payment"
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

      {/* Recent Payments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Recent Payments
          </h4>
          <span className="text-sm text-gray-500">
            {recentPayments.length} payments
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No recent payments</p>
          </div>
        ) : (
          recentPayments.map((payment: DoctorPayment) => (
            <div
              key={payment.id}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="text-green-600" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {payment.patientName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {payment.paymentMethod || "Payment"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      payment.paymentStatus
                    )}`}>
                    {payment.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    {formatDate(payment.paymentDate || payment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{formatTime(payment.slot)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Amount: </span>
                  <span className="font-semibold text-green-600">
                    ₦{payment.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getStatusIcon(payment.paymentStatus)}
                  <span>{payment.paymentStatus}</span>
                </div>
                <Link
                  href="/doctor/payment"
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

export default PaymentWidget;
