"use client";

import { useState } from "react";
import { FileText, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import DocumentReviewModal from "@/components/modals/DocumentReviewModal";

interface DoctorUpload {
  id: string;
  doctorName: string;
  specialty: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
}

const mockData: DoctorUpload[] = [
  {
    id: "1",
    doctorName: "Dr. Tunde Simeon",
    specialty: "Cardiologist",
    uploadDate: "2 January 2025",
    status: "pending",
    documents: [
      {
        id: "1",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "2",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
      { id: "3", name: "Medical Licenses.pdf", size: "200 KB", type: "pdf" },
      {
        id: "4",
        name: "Professional Membership.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "2",
    doctorName: "Dr. Ernest Simeon",
    specialty: "Dermatologist",
    uploadDate: "2 January 2025",
    status: "rejected",
    documents: [
      {
        id: "5",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "6",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "3",
    doctorName: "Dr. Godwin Simeon",
    specialty: "Pediatrician",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "7",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "8",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "4",
    doctorName: "Dr. Daniel Simeon",
    specialty: "Cardiologist",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "9",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "10",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "5",
    doctorName: "Dr. Seun Simeon",
    specialty: "Dermatologist",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "11",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "12",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "6",
    doctorName: "Dr. Abbey Simeon",
    specialty: "Pediatrician",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "13",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "14",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "7",
    doctorName: "Dr. Wale Simeon",
    specialty: "Cardiologist",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "15",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "16",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "8",
    doctorName: "Dr. Pelumi Simeon",
    specialty: "Dermatologist",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "17",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "18",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "9",
    doctorName: "Dr. Happiness Simeon",
    specialty: "Pediatrician",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "19",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "20",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
  {
    id: "10",
    doctorName: "Dr. Jane Simeon",
    specialty: "Cardiologist",
    uploadDate: "2 January 2025",
    status: "approved",
    documents: [
      {
        id: "21",
        name: "Medical Certification.pdf",
        size: "200 KB",
        type: "pdf",
      },
      {
        id: "22",
        name: "Malpractice Insurance.pdf",
        size: "200 KB",
        type: "pdf",
      },
    ],
  },
];

export default function DocumentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUpload, setSelectedUpload] = useState<DoctorUpload | null>(
    null
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  const filteredData = mockData.filter((upload) =>
    upload.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReviewDocument = (upload: DoctorUpload) => {
    setSelectedUpload(upload);
    setIsReviewModalOpen(true);
  };

  const handleViewDocument = (upload: DoctorUpload) => {
    setSelectedUpload(upload);
    setIsReviewModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "pending":
        return `${baseClasses} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200`;
      case "approved":
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200`;
      case "rejected":
        return `${baseClasses} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case "pending":
        return "Review Document";
      case "approved":
      case "rejected":
        return "View";
      default:
        return "View";
    }
  };

  const handleAction = (upload: DoctorUpload) => {
    if (upload.status === "pending") {
      handleReviewDocument(upload);
    } else {
      handleViewDocument(upload);
    }
  };

  return (
    <div>
      <Title title="Uploads" />

      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search doctor name..."
        />
      </div>

      {/* Table */}
      <div
        className="rounded-lg  border overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}>
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{
              color: "var(--card-foreground)",
            }}>
            <thead
              style={{
                backgroundColor: "var(--muted)",
                borderBottomColor: "var(--border)",
              }}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  DOCTOR
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  SPECIALTY
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  UPLOAD DATE
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  STATUS
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-[var(--border)]"
              style={{
                backgroundColor: "var(--card)",
                borderTopColor: "var(--border)",
              }}>
              {paginatedData.map((upload) => (
                <tr
                  key={upload.id}
                  className="transition-colors duration-200"
                  style={{
                    backgroundColor: "var(--card)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--card)";
                  }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: "var(--card-foreground)",
                      }}>
                      {upload.doctorName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm"
                      style={{
                        color: "var(--muted-foreground)",
                      }}>
                      {upload.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm"
                      style={{
                        color: "var(--muted-foreground)",
                      }}>
                      {upload.uploadDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(upload.status)}
                      <span className={getStatusBadge(upload.status)}>
                        {upload.status.charAt(0).toUpperCase() +
                          upload.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleAction(upload)}
                      className="text-[#44CE2D] hover:text-[#3bb025] text-sm font-medium cursor-pointer transition-colors duration-200">
                      {getActionText(upload.status)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div
          className="text-sm"
          style={{
            color: "var(--muted-foreground)",
          }}>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--card-foreground)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "var(--muted)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "var(--card)";
              }
            }}>
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#3bb025";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "var(--primary)";
              }
            }}>
            Next
          </button>
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedUpload && (
        <DocumentReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedUpload(null);
          }}
          upload={selectedUpload}
        />
      )}
    </div>
  );
}
