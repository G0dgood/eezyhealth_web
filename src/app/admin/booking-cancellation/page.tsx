"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import CancellationDetailsModal from "@/components/modals/CancellationDetailsModal";

import {
  useGetBookingCancellationsQuery,
  useRespondToCancellationRequestMutation,
} from "@/store/bookingCancellationApi";
import { toast } from "sonner";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { FirebaseBookingCancellation } from "@/types";
import Pagination from "@/components/Pagination";
import { useApiError } from "@/hooks/useApiError";

export default function AdminBookingCancellationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<FirebaseBookingCancellation | null>(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Respond to cancellation request mutation
  const [respondToCancellation, { isLoading: isResponding }] =
    useRespondToCancellationRequestMutation();

  // Fetch booking cancellations from API
  const {
    data: cancellations,
    isLoading,
    error,
    refetch,
  } = useGetBookingCancellationsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
  });

  const paginatedData = useMemo(() => {
    return (cancellations || []) as any[];
  }, [cancellations]);

  const totalCount = (cancellations as any)?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  useApiError(!!error, error, "Failed to load booking cancellations. Please try again.");

  // Handle approve/reject cancellation requests
  const handleApproveCancellation = async (bookingId: string) => {
    try {
      await respondToCancellation({
        bookingId,
        status: "approved",
        adminResponse: "Cancellation request approved",
      }).unwrap();

      toast.success("Cancellation request approved successfully!");
      refetch(); // Refresh the data
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Failed to approve cancellation request. Please try again.");
      console.error("Error approving cancellation:", error);
    }
  };

  const handleRejectCancellation = async (bookingId: string) => {
    try {
      await respondToCancellation({
        bookingId,
        status: "rejected",
        adminResponse: "Cancellation request rejected",
      }).unwrap();

      toast.success("Cancellation request rejected successfully!");
      refetch(); // Refresh the data
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Failed to reject cancellation request. Please try again.");
      console.error("Error rejecting cancellation:", error);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Booking Cancellation" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2 ">
          Booking Cancellation
        </h1>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Search Input */}
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search cancellations..."
          />
        </div>

        {/* Refresh Button */}
      </div>
      {/* Cancellations Table */}
      {isLoading ? (
        <TableSkeleton
          columns={6}
          rows={5}
          headerLabels={[
            "DOCTOR",
            "PATIENT NAME",
            "USER ID",
            "DATE",
            "STATUS",
            "ACTION",
          ]}
        />
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th>DOCTOR</th>
                  <th>PATIENT NAME</th>
                  <th>USER ID</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {paginatedData?.length === 0 ||
                  paginatedData?.length === undefined ? (
                  <NoRecordFound colSpan={6} />
                ) : (
                  paginatedData.map(
                    (cancellation: Record<string, unknown>, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-[var(--muted)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[10px] md:text-[12px] font-medium text-[var(--foreground)]">
                            {(cancellation.doctorName as string) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[10px] md:text-[12px] text-[var(--foreground)]">
                            {(cancellation.patientName as string) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[10px] md:text-[12px] text-[var(--muted-foreground)]">
                            {(cancellation.userId as string) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-[10px] md:text-[12px] text-[var(--muted-foreground)]">
                            {(cancellation.bookingDate as string) || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${(cancellation.bookingStatus as string)?.toLowerCase() === "cancelled"
                              ? "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20"
                              : (cancellation.bookingStatus as string)?.toLowerCase() === "approved"
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : (cancellation.bookingStatus as string)?.toLowerCase() === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              }`}>
                            {(cancellation.bookingStatus as string) || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            onClick={() => {
                              setSelectedBooking(
                                cancellation as unknown as FirebaseBookingCancellation
                              );
                              setIsCancelModalOpen(true);
                            }}
                            className="text-[var(--primary)] hover:text-[var(--primary)]/80 hover:bg-transparent p-0 h-auto font-medium text-[10px] md:text-[12px]"
                            variant="ghost-neutral"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="bg-[var(--card)] px-4 py-3 border-t border-[var(--border)]">
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
                itemLabel="cancellations"
              />
            </div>
          )}
        </div>
      )}

      {/* Cancellation Details Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title=""
        size="md">
        <CancellationDetailsModal
          booking={selectedBooking}
          isResponding={isResponding}
          onApprove={handleApproveCancellation}
          onReject={handleRejectCancellation}
          showActions={true}
        />
      </Modal>
    </div>
  );
}
