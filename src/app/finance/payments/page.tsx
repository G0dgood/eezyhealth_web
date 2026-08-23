"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Eye,
  FileText,
  RotateCw,
  User,
  Check,
  X,
  Calendar,
} from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Button from "@/components/Button";
import Pagination from "@/components/Pagination";
import PillTabs from "@/components/Tabs/PillTabs";
import { useGetPaymentsQuery } from "@/store/paymentApi";
import {
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
} from "@/store/financeApi";
import ReceiptViewerModal from "@/components/modals/ReceiptViewerModal";
import {
  formatDate,
  getPaymentStatusBadge,
  NoRecordFound,
} from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function FinancePaymentsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";

  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Sync tab from URL if present
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const {
    data: paymentsData,
    isLoading,
    refetch,
  } = useGetPaymentsQuery({});

  const [confirmPayment] = useConfirmPaymentMutation();

  const allPayments = useMemo(() => {
    return Array.isArray(paymentsData) ? paymentsData : [];
  }, [paymentsData]);

  // Tab Counts
  const counts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let failed = 0;
    let refunds = 0;

    allPayments.forEach((p: any) => {
      const status = (p.paymentStatus || p.status || "").toLowerCase();
      if (status === "pending" || status === "reserved") {
        pending++;
      } else if (status === "completed" || status === "done" || status === "confirmed" || status === "successful") {
        completed++;
      } else if (status === "failed" || status === "rejected") {
        failed++;
      } else if (status === "refunded" || status === "refund") {
        refunds++;
      }
    });

    return { all: allPayments.length, pending, completed, failed, refunds };
  }, [allPayments]);

  const tabs = [
    { id: "all", label: `All Payments (${counts.all})` },
    {
      id: "pending",
      label: `Pending Verification (${counts.pending})`,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: "completed",
      label: `Done / Confirmed (${counts.completed})`,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      id: "failed",
      label: `Failed (${counts.failed})`,
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
      id: "refunds",
      label: `Refunds (${counts.refunds})`,
      icon: <RotateCcw className="w-3.5 h-3.5" />,
    },
  ];

  // Filter payments by Tab and Search Query
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p: any) => {
      const status = (p.paymentStatus || p.status || "pending").toLowerCase();

      // Tab filter
      if (activeTab === "pending" && !(status === "pending" || status === "reserved")) {
        return false;
      }
      if (activeTab === "completed" && !(status === "completed" || status === "done" || status === "confirmed" || status === "successful")) {
        return false;
      }
      if (activeTab === "failed" && !(status === "failed" || status === "rejected")) {
        return false;
      }
      if (activeTab === "refunds" && !(status === "refunded" || status === "refund")) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const patientName = (p.patientName || "").toLowerCase();
        const doctorName = (p.doctorName || "").toLowerCase();
        const bankName = (p.bankDetails?.bankName || "").toLowerCase();
        const accNum = (p.bankDetails?.accountNumber || "").toLowerCase();
        const ref = typeof p.paymentReference === "object"
          ? (p.paymentReference?.reference || "").toLowerCase()
          : (p.paymentReference || "").toLowerCase();

        return (
          patientName.includes(query) ||
          doctorName.includes(query) ||
          bankName.includes(query) ||
          accNum.includes(query) ||
          ref.includes(query)
        );
      }

      return true;
    });
  }, [allPayments, activeTab, searchQuery]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const formatNaira = (amt: any) => {
    const num = Number(amt) || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleQuickConfirm = async (payment: any) => {
    try {
      await confirmPayment({
        paymentId: payment.id || "",
        bookingId: payment.bookingId,
        patientId: payment.patientId,
        doctorId: payment.doctorId,
        patientName: payment.patientName,
        doctorName: payment.doctorName,
        amount: payment.amount,
        verifiedBy: userInfo?.display_name || userInfo?.email || "Finance Admin",
      }).unwrap();

      toast.success("Payment confirmed and booking scheduled!");
      refetch();
    } catch (err: any) {
      toast.error(err?.error || "Failed to confirm payment.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title title="Payments Management" />
          <p className="text-[12px] text-gray-500 mt-1">
            Review transfer receipts, verify payments, and manage refunds.
          </p>
        </div>
        <Button
          variant="outline-neutral"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 self-start md:self-auto"
        >
          <RotateCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PillTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            setActiveTab(tabId);
            setCurrentPage(1);
          }}
        />

        <div className="w-full lg:w-72">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setCurrentPage(1);
            }}
            placeholder="Search patient, doctor, bank, ref..."
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Doctor &amp; Appointment
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Bank Account / Ref
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Receipt Photo
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedPayments.length === 0 ? (
                  <NoRecordFound colSpan={8} />
                ) : (
                  paginatedPayments.map((payment: any) => {
                    const status = (payment.paymentStatus || payment.status || "pending").toLowerCase();
                    const isPending = status === "pending" || status === "reserved";

                    return (
                      <tr
                        key={payment.id || Math.random()}
                        className="hover:bg-gray-50/80 transition"
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 text-[#44CE2D] font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {payment.patientName?.charAt(0) || <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">
                                {payment.patientName || "Anonymous Patient"}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                ID: {payment.patientId?.slice(0, 8) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-gray-800">
                            {payment.doctorName || "Doctor Consultation"}
                          </p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {payment.bookingDate || "N/A"} &bull; {payment.slot || "Slot"}
                          </p>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs font-extrabold text-gray-900">
                            {formatNaira(payment.amount)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs font-medium text-gray-800">
                            {payment.bankDetails?.bankName || "Bank Transfer"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {payment.bankDetails?.accountNumber ||
                              (typeof payment.paymentReference === "object"
                                ? payment.paymentReference?.reference
                                : payment.paymentReference || "N/A")}
                          </p>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {payment.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsReceiptModalOpen(true);
                              }}
                              className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium group"
                            >
                              <img
                                src={payment.receiptUrl}
                                alt="Receipt"
                                className="w-7 h-7 object-cover rounded-md border border-gray-300 group-hover:scale-110 transition-transform"
                              />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5" /> No photo
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(payment.paymentStatus || payment.status)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                          {payment.createdAt ? formatDate(payment.createdAt) : "N/A"}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline-neutral"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="!text-[11px] py-1 px-2.5"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> Review
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleQuickConfirm(payment)}
                                className="!bg-[#44CE2D] !text-[11px] py-1 px-2.5 hover:!bg-[#3bb826]"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Confirm
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline-neutral"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsReceiptModalOpen(true);
                              }}
                              className="!text-[11px] py-1 px-2.5"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Details
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPayments.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of{" "}
              {filteredPayments.length} entries
            </span>
            <Pagination
              currentPage={currentPage}
              totalCount={filteredPayments.length}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptViewerModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
