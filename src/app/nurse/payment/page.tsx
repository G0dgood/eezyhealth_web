"use client";

import { useState, useEffect } from "react";
import { MoreVertical, CreditCard, Eye } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import { useGetPaymentsQuery } from "@/store/api";
import { toast } from "sonner";

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
  paymentReference?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function NursePaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // RTK hooks
  const {
    data: payments = [],
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : "Error loading payments. Please try again.";
      toast.error(errorMessage);
    }
  }, [error]);

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

  // Helper function to safely render payment field values
  const safeRenderField = (value: unknown, fallback: string = "N/A") => {
    if (typeof value === "string") {
      return value;
    } else if (typeof value === "number") {
      return value.toString();
    } else if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    } else if (value === null || value === undefined) {
      return fallback;
    }
    return fallback;
  };

  return (
    <div>
      <div>
        <div className="flex-1">
          <div className="mb-6">
            <Breadcrumb
              items={[{ label: "Nurse", href: "/nurse" }, { label: "Payment" }]}
            />
          </div>
          <Title title="Payment History" />

          {/* Search Section */}
          <div className="mb-6">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search payments..."
            />
          </div>

          {/* Payments Table */}

          {isLoading ? (
            <TableSkeleton
              columns={5}
              rows={5}
              headerLabels={[
                "Transaction",
                "Amount",
                "Method",
                "Status",
                "Date",
              ]}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th> Transaction </th>
                      <th> Amount </th>
                      <th> Method </th>
                      <th> Status </th>
                      <th> Date </th>
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
                                  <div className="text-sm text-gray-500">
                                    {safeRenderField(
                                      payment.description,
                                      "Payment transaction"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(
                                  typeof payment?.amount === "number"
                                    ? payment?.amount
                                    : 0,
                                  typeof payment?.currency === "string"
                                    ? payment?.currency
                                    : "₦"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {safeRenderField(payment.paymentMethod, "")}
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
                                : "-"}
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
