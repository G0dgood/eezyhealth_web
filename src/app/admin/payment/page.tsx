"use client";

import { useState, useMemo } from "react";
import { CreditCard } from "lucide-react";
import { useApiError } from "@/hooks/useApiError";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import { PaymentTableSkeleton } from "@/components/ui/payment-table-skeleton";
import {
  PaymentHeaderSkeleton,
  PaymentSearchSkeleton,
} from "@/components/ui/payment-header-skeleton";
import { useGetPaymentsQuery } from "@/store/paymentApi";
import Dropdown from "@/components/Dropdown";
import { useGetFirebaseDoctorsQuery } from "@/store/doctorFirebaseApi";
import { useEffect } from "react";

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
  id?: string; // Sometimes id is added by the fetching logic
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
  if (typeof value === "object") {
    // For objects like transactionId or paymentReference, try to return reference
    // @ts-ignore
    return value?.reference || value?.trxref || fallback;
  }
  return fallback;
};

export default function AdminPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // RTK hooks
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetPaymentsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    status: selectedStatus,
    doctorId: selectedDoctorId || undefined,
  });

  useApiError(!!error, error, "Failed to load payments. Please try again.");

  // Doctors for the filter dropdown
  const { data: doctorsData, isLoading: isLoadingDoctors } = useGetFirebaseDoctorsQuery({});
  const doctorsList = useMemo(() => (doctorsData || []) as any[], [doctorsData]);

  const getDoctorName = (doc: any) =>
    doc.display_name ||
    doc.name ||
    [doc.first_name, doc.last_name].filter(Boolean).join(" ").trim() ||
    doc.email ||
    "Doctor";

  const getDoctorNameForTable = (doctorId: string) => {
    const doc = doctorsList.find((d) => (d.uid || d.doctorId || d.id) === doctorId);
    return doc ? getDoctorName(doc) : "Unknown Doctor";
  };

  // Reset to first page when any search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDoctorId]);

  // Ensure payments is always an array
  const payments = useMemo(() => {
    if (Array.isArray(paymentsData)) {
      return paymentsData;
    }
    if (
      paymentsData &&
      typeof paymentsData === "object" &&
      "data" in paymentsData &&
      Array.isArray((paymentsData as { data: unknown }).data)
    ) {
      return (paymentsData as { data: any[] }).data;
    }
    return [];
  }, [paymentsData]);

  const paginatedPayments = useMemo(() => {
    return payments;
  }, [payments]);

  const totalCount = (paymentsData as any)?.totalCount || 0;

  const getStatusBadge = (paymentStatus: string) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800 border border-green-300",
      success: "bg-green-100 text-green-800 border border-green-300",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      failed: "bg-red-100 text-red-800 border border-red-300",
      cancelled: "bg-gray-100 text-gray-800 border border-gray-300",
    };

    const statusKey = paymentStatus?.toLowerCase() || "pending";

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[statusKey as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800 border border-gray-300"
          }`}
      >
        {paymentStatus}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method?.toLowerCase() || "";
    if (methodLower.includes("paystack")) return <CreditCard className="w-4 h-4 text-blue-600" />;
    if (methodLower.includes("card")) return <CreditCard className="w-4 h-4 text-blue-600" />;
    if (methodLower.includes("bank") || methodLower.includes("transfer")) return <span className="text-green-600 font-bold">₦</span>;
    if (methodLower.includes("cash")) return <span className="text-green-600 font-bold">₦</span>;
    if (methodLower.includes("mobile")) return <CreditCard className="w-4 h-4 text-purple-600" />;
    return <CreditCard className="w-4 h-4 text-gray-600" />;
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    let numericAmount = 0;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount.replace(/,/g, ''));
    } else {
      numericAmount = amount;
    }

    if (isNaN(numericAmount)) return `${currency} ${amount}`;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "NGN",
    }).format(numericAmount);
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
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Dropdown
                  value={selectedDoctorId}
                  onChange={(value) => setSelectedDoctorId(value)}
                  options={[
                    { value: "", label: "All Doctors" },
                    ...doctorsList.map((doc) => ({
                      value: doc.uid || doc.doctorId || doc.id,
                      label: getDoctorName(doc),
                    })),
                  ]}
                  placeholder={
                    isLoadingDoctors ? "Loading doctors..." : "All Doctors"
                  }
                  className="w-64 shadow-none"
                  variant="default"
                />
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
            </div>
          )}

          {/* Payments Table */}
          {isLoading ? (
            <PaymentTableSkeleton />
          ) : (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
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
                                <div className="text-[10px] md:text-[12px] font-medium text-[var(--foreground)]">
                                  {safeRenderField(
                                    payment.patientName,
                                    "Unknown Patient"
                                  )}
                                </div>
                                <div className="text-[10px] md:text-[12px] text-[var(--muted-foreground)]">
                                  ID: {payment.id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-[10px] md:text-[12px] text-[var(--foreground)]">
                                {safeRenderField(
                                  getDoctorNameForTable(payment.doctorId as string),
                                  "Unknown Doctor"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-[10px] md:text-[12px] text-[var(--foreground)] capitalize">
                                {payment.slot ? String(payment.slot).replace(/_/g, " ") : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-[10px] md:text-[12px] font-medium text-[var(--foreground)]">
                                {formatCurrency(
                                  payment.amount as string | number,
                                  (payment.currency as string) || "NGN"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(
                                  typeof payment.paymentMethod === "string"
                                    ? payment.paymentMethod
                                    : "Unknown"
                                )}
                                <span className="text-[10px] md:text-[12px] text-[var(--foreground)]">
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
                              <div className="text-[10px] md:text-[12px] text-[var(--foreground)]">
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
              {/* Pagination */}
              {!isLoading && !error && (
                <Pagination
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                  itemLabel="payments"
                  className="mt-4"
                />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
