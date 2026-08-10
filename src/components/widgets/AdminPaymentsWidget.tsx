"use client";

import React from "react";
import { CreditCard, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useGetPaymentsQuery } from "@/store/paymentApi";

interface PaymentData {
  amount: string;
  bookingDate: string;
  channel: string;
  createdAt: string;
  currency: string;
  doctorId: string;
  doctorPhotoUrl: string;
  patientId: string;
  patientName: string;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: {
    message: string;
    redirecturl: string;
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
  };
  paymentStatus: string;
  reason: string;
  slot: string;
  transactionId: {
    message: string;
    redirecturl: string;
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    trxref: string;
  };
  updatedAt: string;
  id?: string;
}

const AdminPaymentsWidget: React.FC = () => {
  const {
    data: paymentsData,
    isLoading,
  } = useGetPaymentsQuery({ limit: 100 });

  // Ensure payments is always an array
  let payments: PaymentData[] = [];
  if (Array.isArray(paymentsData)) {
    payments = paymentsData as unknown as PaymentData[];
  } else if (
    paymentsData &&
    typeof paymentsData === "object" &&
    "data" in paymentsData &&
    Array.isArray((paymentsData as { data: unknown }).data)
  ) {
    payments = (paymentsData as { data: PaymentData[] }).data;
  }

  // Helper to parse amount string "10,000" -> 10000
  const parseAmount = (amountStr: string | number | undefined) => {
    if (typeof amountStr === 'number') return amountStr;
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/,/g, ''));
  };

  // Get recent payments (last 5)
  const recentPayments = [...payments]
    .sort((a: PaymentData, b: PaymentData) => {
      const dateA = new Date(a.createdAt || a.paymentDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.paymentDate || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Calculate payment statistics
  const totalRevenue = payments
    .filter((payment: PaymentData) => payment.paymentStatus === "completed" || payment.paymentStatus === "success")
    .reduce(
      (sum: number, payment: PaymentData) => sum + parseAmount(payment.amount),
      0
    );

  const completedPayments = payments.filter(
    (payment: PaymentData) => payment.paymentStatus === "completed" || payment.paymentStatus === "success"
  ).length;

  const pendingPayments = payments.filter(
    (payment: PaymentData) => payment.paymentStatus === "pending"
  ).length;

  const failedPayments = payments.filter(
    (payment: PaymentData) => payment.paymentStatus === "failed"
  ).length;

  const averagePayment =
    completedPayments > 0 ? totalRevenue / completedPayments : 0;

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

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800 border border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "completed":
      case "success":
        return <TrendingUp size={14} className="text-green-600" />;
      case "pending":
        return <AlertCircle size={14} className="text-yellow-600" />;
      case "failed":
        return <AlertCircle size={14} className="text-red-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
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

  // On error, fall through to the empty state below rather than showing a
  // raw error message.
  if (recentPayments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="text-gray-400" size={32} />
          </div>
          <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
            No Payments Found
          </h3>
          <p className=" text-[10px]  md:text-[12px] text-gray-500 text-center mb-4">
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
            <h3 className="text-[14px] md:text-[16px] md:text-[16px] md:text-[18px] font-bold text-gray-900">Recent Payments</h3>
            <p className="text-xs md: text-[10px]  md:text-[12px] text-gray-500">Latest payment transactions</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] md:text-[18px] md:text-[20px] font-bold text-green-600">
            ₦{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-[14px]text-[18px] md:text-[20px]-[16px] md:text-[18px] md:text-[20px] font-bold text-blue-600">
            {completedPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-[14px]text-[18px] md:text-[20px]-[16px] md:text-[18px] md:text-[20px] font-bold text-yellow-600">
            {pendingPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-red-50 rounded-lg">
          <div className="text-[14px]text-[18px] md:text-[20px]-[16px] md:text-[18px] md:text-[20px] font-bold text-red-600">
            {failedPayments}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Failed</div>
        </div>
      </div>

      {/* Recent Payments List */}
      <div className="space-y-3 md:space-y-4">
        {recentPayments.map((payment: PaymentData, index: number) => (
          <div
            key={payment.id || `payment-${index}`}
            className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium  text-[10px]  md:text-[12px] md:text-base text-gray-900 truncate">
                    ₦{parseAmount(payment.amount).toFixed(2)}
                  </h4>
                  <p className="text-xs md: text-[10px]  md:text-[12px] text-gray-600 truncate">
                    {payment.patientName || "Unknown Patient"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-medium rounded-full ${getStatusColor(
                    payment.paymentStatus
                  )}`}
                >
                  {payment.paymentStatus}
                </span>
                {getStatusIcon(payment.paymentStatus)}
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              {payment.doctorId && (
                <div className="flex items-center gap-2 text-xs md: text-[10px]  md:text-[12px] text-gray-600">
                  <span className="text-[10px] md:text-xs">👨‍⚕️</span>
                  <span className="truncate">{payment.doctorId}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs md: text-[10px]  md:text-[12px] text-gray-600">
                <span className="text-[10px] md:text-xs">💳</span>
                <span>{payment.paymentMethod || "Card Payment"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs md: text-[10px]  md:text-[12px] text-gray-600">
                <span className="text-[10px] md:text-xs">📅</span>
                <span>{formatDate(payment.createdAt || payment.paymentDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CreditCard size={14} />
                <span>
                  Payment ID:{" "}
                  {payment.paymentReference?.reference || payment.transactionId?.reference || (payment.id ? payment.id.slice(0, 8) + "..." : "N/A")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4  text-[10px]  md:text-[12px]">
          <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">
            Average Payment: ₦{averagePayment.toFixed(2)}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">
                Completed: {completedPayments}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Pending: {pendingPayments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-600 text-xs md: text-[10px]  md:text-[12px]">Failed: {failedPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsWidget;
