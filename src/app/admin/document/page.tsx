"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import Pagination from "@/components/Pagination";
import Button from "@/components/Button";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import DocumentReviewModal from "@/components/modals/DocumentReviewModal";
import { useGetUploadsQuery } from "@/store/uploadApi";
import FormattedDate from "@/utils/FormattedDate";
import DocumentTableSkeleton from "@/components/skeletons/DocumentTableSkeleton";
import { toast } from "sonner";
import Dropdown from "@/components/Dropdown";
import { useGetFirebaseDoctorsQuery } from "@/store/doctorFirebaseApi";
import { useApiError } from "@/hooks/useApiError";

// Removed unused interfaces - using comprehensive Upload interface below

interface Upload {
  id: string;
  doctorId?: string;
  doctorName?: string;
  description?: string;
  specialization?: string;
  downloadUrl?: string;
  uploadDate?: any;
  status?: "pending" | "approved" | "rejected";
  comment?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  // Additional fields for user data compatibility
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

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  // Fetch uploads from RTK Query
  const { data: uploads, isLoading, error, refetch } = useGetUploadsQuery({});

  useApiError(!!error, error, "Failed to load document uploads. Please try again.");

  // Fetch doctors for filter dropdown
  const { data: doctorsData, isLoading: isLoadingDoctors } = useGetFirebaseDoctorsQuery({});
  const doctorsList = useMemo(() => (doctorsData || []) as any[], [doctorsData]);

  const getDoctorName = (doc: any) =>
    doc.display_name ||
    doc.name ||
    [doc.first_name, doc.last_name].filter(Boolean).join(" ").trim() ||
    doc.email ||
    "Doctor";

  // Reset to first page when search term or selected doctor changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDoctorId]);

  // Safely extract uploads data
  const safeUploadTwo = uploads && "uploads" in uploads ? uploads.uploads : [];

  // Filter uploads based on search term and selected doctor
  const filteredData = useMemo(() => {
    const safeUploads = Array.isArray(safeUploadTwo) ? safeUploadTwo : [];
    if (safeUploads.length === 0) return [];

    let result = safeUploads;

    // Apply selected doctor filter
    if (selectedDoctorId) {
      result = result.filter((upload: Upload) => {
        const uploadDocId = upload.doctorId || upload.uid || "";
        return uploadDocId === selectedDoctorId;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((upload: Upload) => {
        const nameMatch = (upload?.doctorName ?? "")
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
    }

    return result;
  }, [safeUploadTwo, searchTerm, selectedDoctorId]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage) || 1;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



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
        return `${base} bg-yellow-100 text-yellow-800 border border-yellow-300`;
      case "approved":
        return `${base} bg-green-100 text-green-800 border border-green-300`;
      case "rejected":
        return `${base} bg-red-100 text-red-800 border border-red-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 border border-gray-300`;
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
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Documents" },
          ]}
        />
      </div>

      <PageHeader
        title="Documents"
        description="Review and manage medical and credential document uploads from doctors."
      />

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search doctor name..."
          />
        </div>
        <Dropdown
          value={selectedDoctorId}
          onChange={(value) => setSelectedDoctorId(value)}
          options={[
            { value: "", label: "All Doctors" },
            ...doctorsList.map((doc) => ({
              value: doc.uid || doc.doctorId || doc.id,
              label: getDoctorName(doc),
            })),
          ]}
          placeholder={
            isLoadingDoctors ? "Loading doctors..." : "All Doctors"
          }
          className="w-64 shadow-none"
          variant="default"
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
                {["Doctor", "Specialty", "Action"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {header}
                  </th>
                ))}
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
                    <td className="px-6 py-4 text-[10px] md:text-[12px] font-medium">
                      {upload.doctorName || "Unknown Doctor"}
                    </td>
                    <td className="px-6 py-4 text-[10px] md:text-[12px]">
                      {upload.specialization || upload.location || "—"}
                    </td>
                    {/* <td className="px-6 py-4 text-[10px] md:text-[12px]">
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
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost-primary"
                        size="sm"
                        onClick={() => handleAction(upload)}
                        className="px-2"
                      >
                        {getActionText(upload.status)}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[10px] md:text-[12px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No uploads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalCount={filteredData.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
            itemLabel="documents"
          />
        )}
      </div>


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
