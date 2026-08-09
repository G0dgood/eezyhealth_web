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
import { useGetRefundsQuery, useProcessRefundMutation } from "@/store/refundApi";
import { useGetPricingQuery } from "@/store/pricingApi";
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

export default function NurseRefundsPage() {
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
        actor: "nurse",
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
            items={[{ label: "Nurse", href: "/nurse" }, { label: "Refunds" }]}
          />
        </div>
        <Title title="Refund Management" />

        {/* Search Section and Status Toggle */}
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
            layoutId="nurse-refund-tabs"
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
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th> Patient </th>
                    <th> Doctor </th>
                    <th> Amount </th>
                    <th> Reason </th>
                    <th> Date </th>
                    <th> Action </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refunds?.length === 0 ? (
                    <NoRecordFound colSpan={6} />
                  ) : (
                    refunds?.map((refund: any) => (
                      <tr key={refund.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-[12px] font-medium text-gray-900">
                                {refund.patientName || "Unknown Patient"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Booking Ref: {refund.bookingId?.slice(0, 8) || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[12px] text-gray-900 font-medium">
                            {refund.doctorName || "Unknown Doctor"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[12px] font-medium text-gray-900">
                            {formatCurrency(feeOf(refund))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[12px] text-gray-700 max-w-xs truncate">
                            {refund.reason || "No reason provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-500">
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
                <p className="text-sm font-semibold text-gray-900">
                  {selectedRefund.patientName || "Unknown Patient"}
                </p>
                <p className="text-xs text-gray-500">
                  Booking Ref: {selectedRefund.bookingId?.slice(0, 8) || "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 mb-5">
              {[
                { label: "Doctor", value: selectedRefund.doctorName || "—" },
                {
                  label: "Amount",
                  value: formatCurrency(feeOf(selectedRefund)),
                },
                {
                  label: "Reason",
                  value: selectedRefund.reason || "No reason provided",
                },
                {
                  label: "Requested",
                  value: formatDate(selectedRefund.requestedAt),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <span className="text-[13px] text-gray-500">{row.label}</span>
                  <span className="text-[13px] font-medium text-gray-900 text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleProcess("rejected")}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
    </div>
  );
}
