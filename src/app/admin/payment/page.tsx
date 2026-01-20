"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import { NoRecordFound } from "@/components/Options";
import { PaymentTableSkeleton } from "@/components/ui/payment-table-skeleton";
import {
  PaymentHeaderSkeleton,
  PaymentSearchSkeleton,
} from "@/components/ui/payment-header-skeleton";
import { useGetPaymentsQuery } from "@/store/paymentApi";
import Dropdown from "@/components/Dropdown";

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  patientId?: string;
  doctorId?: string;
  bookingId?: string;
  description?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Utility function to safely render field values
const safeRenderField = (value: unknown, fallback: string = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return fallback;
};

export default function AdminPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // RTK hooks
  const {
    data: payments = [],
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });

  // Filter payments based on search query and status
  const filteredPayments = payments.filter(
    (payment: Record<string, unknown> & { id: string }) => {
      const searchLower = searchQuery.toLowerCase();

      // Helper function to safely convert to string and search
      const safeSearch = (value: unknown): boolean => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchLower);
        } else if (typeof value === "number") {
          return value.toString().toLowerCase().includes(searchLower);
        }
        return false;
      };

      const matchesSearch =
        safeSearch(payment?.patientName) ||
        safeSearch(payment?.doctorName) ||
        safeSearch(payment?.paymentMethod) ||
        safeSearch(payment?.transactionId);

      const matchesStatus =
        !selectedStatus ||
        (typeof payment.status === "string" &&
          payment.status === selectedStatus);

      return matchesSearch && matchesStatus;
    }
  );

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (paymentStatus: string) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[paymentStatus as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
          }`}
      >
        {paymentStatus}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "paystack":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "credit card":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "bank transfer":
        return <span className="text-green-600">₦</span>;
      case "cash":
        return <span className="text-green-600">₦</span>;
      case "mobile money":
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div>
      <div>
        <div className="flex-1">
          <div className="mb-6">
            <Breadcrumb
              items={[{ label: "Admin", href: "/admin" }, { label: "Payment" }]}
            />
          </div>

          {isLoading ? (
            <PaymentHeaderSkeleton />
          ) : (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Management
              </h1>
              <p className="text-gray-600">
                Manage and track all payment transactions
              </p>
            </div>
          )}

          {/* Search Section */}
          {isLoading ? (
            <PaymentSearchSkeleton />
          ) : (
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search payments..."
                />
              </div>
              <Dropdown
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                placeholder="All Statuses"
                className="w-40"
                variant="default"
              />
            </div>
          )}

          {/* Payments Table */}
          {isLoading ? (
            <PaymentTableSkeleton />
          ) : (
            <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)]">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Transaction Id</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                    {paginatedPayments?.length === 0 ||
                      paginatedPayments?.length === undefined ? (
                      <NoRecordFound colSpan={7} />
                    ) : (
                      paginatedPayments?.map(
                        (payment: Record<string, unknown> & { id: string }) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-[var(--muted)]"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-[var(--foreground)]">
                                  {safeRenderField(
                                    payment.patientName,
                                    "Unknown Patient"
                                  )}
                                </div>
                                <div className="text-sm text-[var(--muted-foreground)]">
                                  ID: {payment.id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[var(--foreground)]">
                                {safeRenderField(
                                  payment.doctorName,
                                  "Unknown Doctor"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[var(--foreground)]">
                                {safeRenderField(payment.slot, "N/A")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[var(--foreground)]">
                                ₦{" "}
                                {typeof payment.amount === "number"
                                  ? formatCurrency(
                                    payment.amount as number,
                                    typeof payment.currency === "string"
                                      ? payment.currency
                                      : "NGN"
                                  )
                                  : safeRenderField(payment.amount, "N/A")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(
                                  typeof payment.paymentMethod === "string"
                                    ? payment.paymentMethod
                                    : "Unknown"
                                )}
                                <span className="text-sm text-[var(--foreground)]">
                                  {safeRenderField(
                                    payment.paymentMethod,
                                    "Unknown"
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(
                                typeof payment.paymentStatus === "string"
                                  ? payment.paymentStatus
                                  : "unknown"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[var(--foreground)]">
                                {safeRenderField(
                                  payment.transactionId,
                                  payment.id
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
