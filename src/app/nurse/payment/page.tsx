"use client";

import { useState, useEffect, useMemo } from "react";
import { MoreVertical, CreditCard, Eye } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { useGetFirebaseDoctorsQuery } from "@/store/doctorFirebaseApi";
import Dropdown from "@/components/Dropdown";

const getDoctorName = (doc: any) => {
  if (doc.displayName) return doc.displayName;
  if (doc.name) return doc.name;
  if (doc.first_name) {
    return `${doc.title || "Dr."} ${doc.first_name} ${doc.last_name || ""}`.trim();
  }
  return doc.email || "Unknown Doctor";
};

import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Pagination from "@/components/Pagination";
import { useGetPaymentsQuery } from "@/store/paymentApi";
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
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // Fetch doctors for filter dropdown
  const { data: doctorsData } = useGetFirebaseDoctorsQuery({});
  const doctors = useMemo(() => {
    return (doctorsData || []) as any[];
  }, [doctorsData]);

  // RTK hooks
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });

  // Ensure payments is always an array (same logic as NursePaymentWidget)
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

  // Filter payments based on search query and selected doctor
  const filteredPayments = useMemo(() => {
    let result = payments || [];

    if (selectedDoctorId) {
      result = result.filter(
        (payment: any) => payment?.doctorId === selectedDoctorId
      );
    }

    if (!searchQuery) return result;

    return result.filter(
      (payment: any) => {
        const searchLower = searchQuery.toLowerCase();

        const safeSearch = (value: unknown): boolean => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchLower);
          } else if (typeof value === "number") {
            return value.toString().toLowerCase().includes(searchLower);
          }
          return false;
        };

        return (
          safeSearch(payment?.patientName) ||
          safeSearch(payment?.paymentMethod) ||
          safeSearch(payment?.paymentStatus) ||
          safeSearch(payment?.status) ||
          safeSearch(payment?.amount) ||
          safeSearch(payment?.paymentReference?.reference) ||
          safeSearch(payment?.transactionId?.reference)
        );
      }
    );
  }, [payments, searchQuery, selectedDoctorId]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (payment: any) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    const status = payment?.paymentStatus || payment?.status;

    switch (status) {
      case "completed":
      case "success":
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

  const formatCurrency = (amount: number | string, currency: string = "NGN") => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₦${numAmount?.toFixed(2) || "0.00"}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

          {/* Search Section and Doctor Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search payments..."
              />
            </div>

            {/* Doctor Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">Doctor:</span>
              <Dropdown
                value={selectedDoctorId}
                onChange={(value) => setSelectedDoctorId(value)}
                options={[
                  { value: "", label: "All Doctors" },
                  ...doctors.map((doc: any) => ({
                    value: doc.uid || doc.doctorId || doc.id,
                    label: getDoctorName(doc),
                  })),
                ]}
                placeholder="Select Doctor"
                className="w-64 shadow-none"
                variant="default"
              />
            </div>
          </div>

          {/* Payments Table */}

          {isLoading ? (
            <TableSkeleton
              columns={5}
              rows={5}
              headerLabels={[
                "Patient",
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
                      <th> Patient </th>
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
                        (payment: any) => (
                          <tr key={payment?.id || payment?.transactionId?.reference} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className=" !text-[10px]  !md:text-[12px] font-medium text-gray-900">
                                    {payment?.patientName || payment?.patient_name || "Unknown Patient"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Ref: {payment?.paymentReference?.reference || payment?.transactionId?.reference || payment?.id?.slice(0, 8) || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className=" !text-[10px]  !md:text-[12px] font-medium text-gray-900">
                                {formatCurrency(payment?.amount, payment?.currency)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className=" !text-[10px]  !md:text-[12px] text-gray-900">
                                {payment?.paymentMethod || payment?.payment_method || "Card Payment"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(payment)}>
                                {getStatusText(payment)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-500">
                              {formatDate(payment?.createdAt || payment?.paymentDate)}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalCount={filteredPayments.length}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
