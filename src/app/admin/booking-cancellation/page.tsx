"use client";

import { useState, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { BookingCancellation } from "@/types";
import { useGetBookingCancellationsQuery } from "@/store/api";
import { toast } from "sonner";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";

export default function AdminBookingCancellationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingCancellation | null>(null);

  // Use mock data as fallback if API fails
  const cancellationsData: BookingCancellation[] = [
    {
      doctor: "Dr. Tunde Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Ernest Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Godwin Sir",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Rejected",
    },
    {
      doctor: "Dr. Daniel Simo",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Seun Sime",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Felix Simed",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Kofi Simeo",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Rejected",
    },
    {
      doctor: "Dr. Fatima Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Joy Simeon",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Tolu Simeon",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
  ];

  // Fetch booking cancellations from API
  const {
    data: cancellations,
    isLoading,
    error,
    refetch,
  } = useGetBookingCancellationsQuery({});

  // Use API data if available, otherwise fall back to mock data
  const dataSource = cancellations || cancellationsData;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataSource;

    return dataSource.filter(
      (cancellation: BookingCancellation) =>
        cancellation.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancellation.patientName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cancellation.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cancellation.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  console.log("cancellations--->", cancellations);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2 ">
          Booking Cancellation
        </h1>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Search Input */}
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search cancellations..."
        />

        {/* Refresh Button */}
        <button
          onClick={() => {
            toast.info("Refreshing cancellations...");
            refetch();
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <span>Refresh</span>
        </button>
      </div>

      {/* Cancellations Summary */}
      {cancellations && cancellations.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Total Cancellations
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {cancellations.length}
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Pending
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {
                cancellations.filter(
                  (c: BookingCancellation) => c.status === "Pending"
                ).length
              }
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Approved
            </div>
            <div className="text-2xl font-bold text-green-600">
              {
                cancellations.filter(
                  (c: BookingCancellation) => c.status === "Approved"
                ).length
              }
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Rejected
            </div>
            <div className="text-2xl font-bold text-red-600">
              {
                cancellations.filter(
                  (c: BookingCancellation) => c.status === "Rejected"
                ).length
              }
            </div>
          </div>
        </div>
      )}

      {/* Cancellations Table */}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
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
              {isLoading ? (
                <SVGLoaderFetch colSpan={7} text="Loading users..." />
              ) : paginatedData?.length === 0 ||
                paginatedData?.length === undefined ? (
                <NoRecordFound colSpan={7} />
              ) : (
                paginatedData.map(
                  (cancellation: BookingCancellation, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-[var(--muted)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {cancellation.doctor}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">
                          {cancellation.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--muted-foreground)]">
                          {cancellation.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--muted-foreground)]">
                          {cancellation.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            cancellation.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : cancellation.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {cancellation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBooking(cancellation);
                            setIsCancelModalOpen(true);
                          }}
                          className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-sm cursor-pointer">
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
          <div className="bg-[var(--card)] px-4 py-3 border-t border-[var(--border)] flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--muted-foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--muted-foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Showing{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    {filteredData.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Details Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title=""
        size="md">
        {selectedBooking && (
          <div className="space-y-4">
            {/* Modal content matching the design */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Channel
                </label>
                <p className="text-gray-900">Video Consultation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID
                </label>
                <p className="text-gray-900">086FnyUQIRE23</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-gray-900">N10,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Reason
                </label>
                <p className="text-gray-900">Emergency surgery scheduled</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                Approve
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
