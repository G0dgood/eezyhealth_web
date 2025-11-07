"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import DocumentReviewModal from "@/components/modals/DocumentReviewModal";
import { useGetUploadsQuery } from "@/store/api";
import FormattedDate from "@/utils/FormattedDate";
import DocumentTableSkeleton from "@/components/skeletons/DocumentTableSkeleton";
import { toast } from "sonner";

// Removed unused interfaces - using comprehensive Upload interface below

interface Upload {
  id: string;
  doctorId?: string;
  name?: string;
  description?: string;
  specialization?: string;
  downloadUrl?: string;
  uploadDate?: any;
  status?: "pending" | "approved" | "rejected";
  comment?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  // Additional fields for user data compatibility
  display_name?: string;
  location?: string;
  uid?: string;
  email?: string;
  createdTime?: any;
  fileName?: string;
  mimeType?: string;
}
export default function DocumentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const itemsPerPage = 10;

  // Fetch uploads from RTK Query
  const { data: uploads, isLoading, isError, refetch } = useGetUploadsQuery({});

  // Handle error with Sonner toast
  useEffect(() => {
    if (isError) {
      toast.error("Error fetching uploads", {
        description: "Failed to load document uploads. Please try again.",
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
        duration: 5000,
      });
    }
  }, [isError, refetch]);

  // Safely extract uploads data
  const safeUploadTwo = uploads && "uploads" in uploads ? uploads.uploads : [];

  // Filter uploads based on search term
  const filteredData = useMemo(() => {
    const safeUploads = Array.isArray(safeUploadTwo) ? safeUploadTwo : [];
    if (safeUploads.length === 0) return [];

    // If no search term, return all uploads
    if (!searchTerm.trim()) return safeUploads;

    const query = searchTerm.toLowerCase();
    return safeUploads.filter((upload: Upload) => {
      const nameMatch = (upload?.name ?? upload?.display_name ?? "")
        .toLowerCase()
        .includes(query);
      const descMatch = (upload?.description ?? "")
        .toLowerCase()
        .includes(query);
      const specMatch = (upload?.specialization ?? upload?.location ?? "")
        .toLowerCase()
        .includes(query);
      const doctorMatch = (upload?.doctorId ?? upload?.uid ?? "")
        .toLowerCase()
        .includes(query);
      const emailMatch = (upload?.email ?? "").toLowerCase().includes(query);
      return nameMatch || descMatch || specMatch || doctorMatch || emailMatch;
    });
  }, [safeUploadTwo, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage) || 1;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  console.log("Paginated Data:", paginatedData);

  const handleAction = (upload: Upload) => {
    setSelectedUpload(upload);
    setIsReviewModalOpen(true);
  };

  // Status helpers
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "approved":
        return `${base} bg-green-100 text-green-800`;
      case "rejected":
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getActionText = (status?: string) => {
    if (status === "pending") return "Review Document";
    return "View";
  };

  // Loading state
  if (isLoading) {
    return <DocumentTableSkeleton />;
  }

  return (
    <div>
      <Title title="Uploads" />

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search doctor name..."
        />
      </div>

      {/* Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{
              color: "var(--card-foreground)",
            }}
          >
            <thead
              style={{
                backgroundColor: "var(--muted)",
                borderBottomColor: "var(--border)",
              }}
            >
              <tr>
                {["Doctor", "Specialty", "Upload Date", "Status", "Action"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {paginatedData.length > 0 ? (
                paginatedData.map((upload: Upload) => (
                  <tr
                    key={upload.id}
                    className="transition-colors duration-200"
                    style={{ backgroundColor: "var(--card)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--muted)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--card)")
                    }
                  >
                    <td className="px-6 py-4 text-sm font-medium">
                      {upload.name || upload.display_name || "Unknown Doctor"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {upload.specialization || upload.location || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <FormattedDate
                        timestamp={upload?.uploadDate || upload?.createdTime}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(upload.status)}
                        <span className={getStatusBadge(upload.status)}>
                          {(upload.status ?? "unknown")
                            .charAt(0)
                            .toUpperCase() +
                            (upload.status ?? "unknown").slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAction(upload)}
                        className="text-[#44CE2D] hover:text-[#3bb025] text-sm font-medium transition-colors"
                      >
                        {getActionText(upload.status)}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No uploads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div
            className="text-sm"
            style={{
              color: "var(--muted-foreground)",
            }}
          >
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--card-foreground)",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Document Review Modal */}
      {selectedUpload && (
        <DocumentReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedUpload(null);
            // Refetch data after modal closes to get updated statuses
            refetch();
          }}
          upload={selectedUpload}
        />
      )}
    </div>
  );
}
