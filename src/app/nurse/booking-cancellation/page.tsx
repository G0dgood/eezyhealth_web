"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
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

export default function NurseBookingCancellationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<FirebaseBookingCancellation | null>(null);

  // Fetch booking cancellations from API
  const {
    data: cancellations,
    isLoading,
    error,
    refetch,
  } = useGetBookingCancellationsQuery({});

  // Respond to cancellation request mutation
  const [respondToCancellation, { isLoading: isResponding }] =
    useRespondToCancellationRequestMutation();

  // Use API data if available, otherwise fall back to mock data
  const dataSource = cancellations || [];

  console.log('cancellations--->', cancellations)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataSource;

    return dataSource.filter((cancellation: Record<string, unknown>) => {
      const doctorName = cancellation.doctorName as string;
      const patientName = cancellation.patientName as string;
      const userId = cancellation.userId as string;
      const status = cancellation.bookingStatus as string;

      return (
        doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [dataSource, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle API responses
  useEffect(() => {
    if (error) {
      toast.error("Failed to load booking cancellations. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, refetch]);

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
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse", href: "/nurse" },
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

      </div>

      {/* Cancellations Table */}

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    DOCTOR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    PATIENT NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    USER ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {paginatedData?.length === 0 ||
                  paginatedData?.length === undefined ? (
                  <NoRecordFound colSpan={7} />
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
                                ? "bg-green-100 text-green-800"
                                : (cancellation.bookingStatus as string)?.toLowerCase() === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              }`}>
                            {(cancellation.bookingStatus as string) || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedBooking(
                                cancellation as unknown as FirebaseBookingCancellation
                              );
                              setIsCancelModalOpen(true);
                            }}
                            className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-[10px] md:text-[12px] cursor-pointer">
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-[var(--card)] px-4 py-3 border-t border-[var(--border)]">
              <Pagination
                currentPage={currentPage}
                totalCount={filteredData.length}
                pageSize={itemsPerPage}
                onPageChange={setCurrentPage}
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
        />
      </Modal>
    </div>
  );
}
