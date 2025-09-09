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
import { useGetPaymentsQuery } from "@/store/api";

interface PaymentData {
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

  // RTK hooks
  const {
    data: payments = [],
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });

  // Filter payments based on search query
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

      return (
        safeSearch(payment?.description) ||
        safeSearch(payment?.paymentMethod) ||
        safeSearch(payment?.status) ||
        safeSearch(payment?.transactionId)
      );
    }
  );

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "cancelled":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
            <div className="mb-6">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search payments..."
              />
            </div>
          )}

          {/* Payments Table */}

          {isLoading ? (
            <PaymentTableSkeleton />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Transaction</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPayments?.length === 0 ||
                    paginatedPayments?.length === undefined ? (
                      <NoRecordFound colSpan={5} />
                    ) : (
                      paginatedPayments?.map(
                        (payment: Record<string, unknown> & { id: string }) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {/* {safeRenderField(payment.transactionId, payment.id.slice(0, 8))} */}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {/* {safeRenderField(payment.description, )} */}
                                    Payment transaction
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  typeof payment.amount === "number"
                                    ? payment.amount
                                    : 0,
                                  typeof payment.currency === "string"
                                    ? payment.currency
                                    : "USD"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {safeRenderField(
                                  payment.paymentMethod,
                                  "Unknown"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={getStatusBadge(
                                  typeof payment.status === "string"
                                    ? payment.status
                                    : "unknown"
                                )}>
                                {safeRenderField(payment.status, "Unknown")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.createdAt &&
                              typeof payment.createdAt === "string"
                                ? new Date(
                                    payment.createdAt
                                  ).toLocaleDateString()
                                : payment.createdAt &&
                                  typeof payment.createdAt === "object"
                                ? new Date(
                                    JSON.stringify(payment.createdAt)
                                  ).toLocaleDateString()
                                : "N/A"}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}>
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
