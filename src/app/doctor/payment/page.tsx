"use client";

import { useState } from "react";
import { useGetPaymentsByDoctorIdQuery } from "@/store/paymentApi";
import { useAuth } from "@/contexts/AuthContext";
import Dropdown from "@/components/Dropdown";
import { Download, CreditCard } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTableSkeleton } from "@/components/ui/PaymentTableSkeleton";
import { DoctorPayment, PaymentFilterData, DoctorPaymentStatus } from "@/types";
import { NoRecordFound } from "@/components/Options";
import { useApiError } from "@/hooks/useApiError";

export default function DoctorPaymentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);

  const [selectedFilters, setSelectedFilters] = useState<PaymentFilterData>({
    dateRange: "",
    paymentStatus: "",
  });

  // Get current doctor ID
  const { user } = useAuth();
  const doctorId =
    user && typeof user === "object" && "uid" in user ? user.uid : null;

  // Use RTK Query hook directly to fetch payments by doctorId
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useGetPaymentsByDoctorIdQuery(
    { doctorId: doctorId! },
    { skip: !doctorId }
  );

  const payments = (paymentsData as unknown as DoctorPayment[]) || [];

  useApiError(!!error, error, "Failed to load payments");

  // Show loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Breadcrumb
            homeHref="/doctor"
            items={[
              { label: "Doctor", href: "/doctor" },
              { label: "Payments", href: "/doctor/payment" },
            ]}
          />
        </div>
        <Title title="Payment Management" />

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Payments Table Skeleton */}
        <PaymentTableSkeleton rows={5} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <Breadcrumb
            homeHref="/doctor"
            items={[
              { label: "Doctor", href: "/doctor" },
              { label: "Payments", href: "/doctor/payment" },
            ]}
          />
        </div>
        <Title title="Payment History" />
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading payments. Please try again.
            <button
              onClick={() => refetch()}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.paymentReference.reference
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedFilters.paymentStatus ||
      payment.paymentStatus === selectedFilters.paymentStatus;

    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  // const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
          }`}
      >
        {status}
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

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Payment", href: "/doctor/payment" },
          ]}
        />
      </div>

      <Title title="Payment Management" />

      {/* Search and Filters */}

      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="w-full md:flex-1 md:max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search payments..."
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Dropdown
            value={selectedFilters.paymentStatus}
            onChange={(value) =>
              setSelectedFilters({
                ...selectedFilters,
                paymentStatus: value as DoctorPaymentStatus | "",
              })
            }
            options={[
              { value: "", label: "All Statuses" },
              { value: "Completed", label: "Completed" },
              { value: "Pending", label: "Pending" },
              { value: "Failed", label: "Failed" },
              { value: "Refunded", label: "Refunded" },
            ]}
            placeholder="All Statuses"
            className="w-40"
            variant="default"
          />

          <button className="flex items-center gap-2 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th>Patient</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status </th>
                <th>Transaction Id</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {currentPayments?.length === 0 ||
                currentPayments?.length === undefined ? (
                <NoRecordFound colSpan={6} />
              ) : (
                currentPayments?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[var(--muted)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className=" text-[10px]  md:text-[12px] font-medium text-[var(--foreground)]">
                          {payment.patientName}
                        </div>
                        <div className=" text-[10px]  md:text-[12px] text-[var(--muted-foreground)]">
                          ID: {payment.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                        {payment.slot}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] font-medium text-[var(--foreground)]">
                        ₦{payment?.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                          {payment.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                        {payment.transactionId.reference}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="text-[#44CE2D] hover:text-[#3bb025] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
