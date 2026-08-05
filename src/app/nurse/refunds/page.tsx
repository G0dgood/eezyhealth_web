"use client";

import { useState, useMemo } from "react";
import { CreditCard, CheckCircle, RefreshCcw } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { useApiError } from "@/hooks/useApiError";
import { useGetRefundsQuery, useProcessRefundMutation } from "@/store/refundApi";
import { toast } from "sonner";

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

  const handleRefund = async (refundId: string, bookingId: string) => {
    try {
      await processRefund({
        refundId,
        bookingId,
        status: "refunded",
        actor: "nurse",
      }).unwrap();

      toast.success("Refund processed successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to process refund. Please try again.");
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

        {/* Search Section and Status Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search refund requests..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-sm bg-transparent border-none outline-none cursor-pointer text-gray-700"
              >
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
            </div>
          </div>
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
                            {formatCurrency(refund.consultationFee)}
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
                              onClick={() => handleRefund(refund.id, refund.bookingId)}
                              disabled={isProcessing}
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
    </div>
  );
}
