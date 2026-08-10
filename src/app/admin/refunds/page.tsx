"use client";

import { useState } from "react";
import { CreditCard, CheckCircle, RefreshCcw, User, X } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/modals/Modal";
import PillTabs from "@/components/Tabs/PillTabs";
import { useApiError } from "@/hooks/useApiError";
import {
  useGetRefundsQuery,
  useProcessRefundMutation,
  useUpdateRefundFinanceStatusMutation,
} from "@/store/refundApi";
import { useGetPricingQuery } from "@/store/pricingApi";
import { notifyRefundFinanceCompleted } from "@/utils/notifications";
import { toast } from "sonner";

const REFUND_TABS = [
  { id: "pending", label: "Pending" },
  { id: "refunded", label: "Refunded" },
  { id: "rejected", label: "Rejected" },
];

// Refund docs store the amount under consultationFee, but older/booking data
// may carry it as amount/pricing — resolve defensively.
const refundAmountOf = (r: any) =>
  Number(r?.consultationFee || r?.amount || r?.pricing || 0);

export default function AdminRefundsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  // Fetch refund requests from API
  const {
    data: refundsData,
    isLoading,
    error,
    refetch,
  } = useGetRefundsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    status: selectedStatus || undefined,
  });

  const [processRefund, { isLoading: isProcessing }] = useProcessRefundMutation();
  const [selectedRefund, setSelectedRefund] = useState<any>(null);

  // Finance sign-off (final "Completed" state on an already-refunded request).
  const [updateFinanceStatus, { isLoading: isFinalizing }] =
    useUpdateRefundFinanceStatusMutation();
  const [financeRefund, setFinanceRefund] = useState<any>(null);

  // Global booking price — fallback for refunds that stored no amount.
  const { data: pricing } = useGetPricingQuery({});
  const globalPrice = Number(pricing?.pricing) || 0;
  const feeOf = (r: any) => refundAmountOf(r) || globalPrice;

  useApiError(!!error, error, "Failed to load refund requests. Please try again.");

  // Ensure refunds is always an array
  let refunds: any[] = [];
  if (Array.isArray(refundsData)) {
    refunds = refundsData;
  } else if (
    refundsData &&
    typeof refundsData === "object" &&
    "data" in refundsData &&
    Array.isArray((refundsData as { data: unknown }).data)
  ) {
    refunds = (refundsData as { data: any[] }).data;
  }

  const totalCount = (refundsData as any)?.totalCount || 0;

  const handleProcess = async (status: "refunded" | "rejected") => {
    if (!selectedRefund) return;
    try {
      await processRefund({
        refundId: selectedRefund.id,
        bookingId: selectedRefund.bookingId,
        status,
        actor: "admin",
      }).unwrap();

      toast.success(
        status === "refunded"
          ? "Refund processed. The patient and doctor have been notified."
          : "Refund request declined. The patient has been notified."
      );
      setSelectedRefund(null);
      refetch();
    } catch (err) {
      toast.error("Failed to update refund. Please try again.");
      console.error(err);
    }
  };

  const handleFinalizeFinance = async () => {
    if (!financeRefund) return;
    try {
      await updateFinanceStatus({
        refundId: financeRefund.id,
        bookingId: financeRefund.bookingId,
        financeStatus: "completed",
        actor: "admin",
      }).unwrap();

      // Notify the patient (and doctor) that the refund is fully completed.
      await notifyRefundFinanceCompleted({
        patientId: financeRefund.patientId,
        doctorId: financeRefund.doctorId,
        patientName: financeRefund.patientName,
        amount: feeOf(financeRefund),
        bookingId: financeRefund.bookingId,
      });

      toast.success("Refund marked as finance completed. The patient has been notified.");
      setFinanceRefund(null);
      refetch();
    } catch (err) {
      toast.error("Failed to update finance status. Please try again.");
      console.error(err);
    }
  };

  const formatCurrency = (amount: number | string) => {
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

  return (
    <div>
      <div className="flex-1">
        <div className="mb-6">
          <Breadcrumb
            items={[{ label: "Admin", href: "/admin" }, { label: "Refunds" }]}
          />
        </div>
        <Title title="Refund Management" />

        {/* Search Section and Status Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search refund requests..."
            />
          </div>

          <PillTabs
            tabs={REFUND_TABS}
            activeTab={selectedStatus}
            onTabChange={(id) => {
              setSelectedStatus(id);
              setCurrentPage(1);
            }}
            layoutId="admin-refund-tabs"
          />
        </div>

        {/* Refunds Table */}
        {isLoading ? (
          <TableSkeleton
            columns={6}
            rows={5}
            headerLabels={[
              "Patient",
              "Doctor",
              "Amount",
              "Reason",
              "Requested Date",
              "Action",
            ]}
          />
        ) : (
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th> Patient </th>
                    <th> Doctor </th>
                    <th> Amount </th>
                    <th> Reason </th>
                    <th> Date </th>
                    <th> Action </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                  {refunds?.length === 0 ? (
                    <NoRecordFound colSpan={6} />
                  ) : (
                    refunds?.map((refund: any) => (
                      <tr key={refund.id} className="hover:bg-[var(--muted)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-[12px] font-medium text-[var(--foreground)]">
                                {refund.patientName || "Unknown Patient"}
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)]">
                                Booking Ref: {refund.bookingId?.slice(0, 8) || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[12px] text-[var(--foreground)] font-medium">
                            {refund.doctorName || "Unknown Doctor"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[12px] font-medium text-[var(--foreground)]">
                            {formatCurrency(feeOf(refund))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[12px] text-[var(--foreground)] max-w-xs truncate">
                            {refund.reason || "No reason provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-[var(--muted-foreground)]">
                          {formatDate(refund.requestedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {refund.status === "pending" ? (
                            <Button
                              onClick={() => setSelectedRefund(refund)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 border-none"
                            >
                              <RefreshCcw className="w-3.5 h-3.5" />
                              Refund Patient
                            </Button>
                          ) : refund.status === "refunded" ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <StatusBadge status={refund.status} />
                              </div>
                              {refund.financeStatus === "completed" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </span>
                              ) : (
                                <button
                                  onClick={() => setFinanceRefund(refund)}
                                  className="text-[11px] font-medium px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                                >
                                  Set Finance Status
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <StatusBadge status={refund.status} />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalCount > 0 && (
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Refund review modal */}
      <Modal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        title="Review Refund Request"
        size="md"
      >
        {selectedRefund && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#44CE2D]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#44CE2D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {selectedRefund.patientName || "Unknown Patient"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Booking Ref: {selectedRefund.bookingId?.slice(0, 8) || "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] mb-5">
              {[
                { label: "Doctor", value: selectedRefund.doctorName || "—" },
                {
                  label: "Amount",
                  value: formatCurrency(feeOf(selectedRefund)),
                },
                { label: "Reason", value: selectedRefund.reason || "No reason provided" },
                { label: "Requested", value: formatDate(selectedRefund.requestedAt) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <span className="text-[13px] text-[var(--muted-foreground)]">
                    {row.label}
                  </span>
                  <span className="text-[13px] font-medium text-[var(--foreground)] text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleProcess("rejected")}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--border)] text-[var(--foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={() => handleProcess("refunded")}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#44CE2D] text-white font-medium py-2.5 rounded-lg hover:bg-[#3bb025] disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {isProcessing ? "Processing…" : "Confirm Refund"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Finance status confirmation (Yes / No) */}
      <Modal
        isOpen={!!financeRefund}
        onClose={() => setFinanceRefund(null)}
        title="Finance Status"
        size="sm"
      >
        {financeRefund && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Mark refund as completed?
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {financeRefund.patientName || "Unknown Patient"} ·{" "}
                  {formatCurrency(feeOf(financeRefund))}
                </p>
              </div>
            </div>

            <p className="text-[13px] text-[var(--muted-foreground)] mb-5">
              This confirms finance has completed the refund payout. This is the
              final status and cannot be undone here.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setFinanceRefund(null)}
                disabled={isFinalizing}
                className="flex-1 border border-[var(--border)] text-[var(--foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleFinalizeFinance}
                disabled={isFinalizing}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {isFinalizing ? "Saving…" : "Yes"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
