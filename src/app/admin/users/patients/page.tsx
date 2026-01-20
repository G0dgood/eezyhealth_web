"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Input from "@/components/Input";
import AddPatientModal from "@/components/modals/AddPatientModal";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";
import { toast } from "sonner";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";

interface Patient {
  display_name: string;
  name?: string;
  location: string;
  id: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  gender?: string;
  age?: number;
  lastConsultation?: string;
}

export default function AdminPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch patients from Firebase
  const {
    data: firebasePatients,
    isLoading,
    error,
    refetch,
  } = useGetFirebasePatientsQuery({});

  // Use Firebase data if available, otherwise fall back to mock data
  const dataSource = (firebasePatients as unknown as Patient[]) ?? [];

  const itemsPerPage = 8;
  const totalPages = Math.ceil((dataSource?.length ?? 0) / itemsPerPage);

  const filteredData = useMemo(() => {
    return dataSource.filter(
      (patient) =>
        patient?.display_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient?.location && patient?.location?.includes(searchTerm)) ||
        patient?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dataSource, searchTerm]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle API responses
  useEffect(() => {
    if (error) {
      toast.error("Failed to load patients. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, refetch]);

  const handleAddPatient = () => {
    setIsAddModalOpen(true);
  };

  const handlePatientAdded = (patientData: {
    name: string;
    gender: "male" | "female";
    dateOfBirth: string;
    phone: string;
    email: string;
  }) => {
    // For now, we'll just close the modal
    setIsAddModalOpen(false);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Patients" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-800 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Title title="Patient Management" />
        </div>

        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search className="w-5 h-5 text-gray-400" />}
              fullWidth
              className="cursor-pointer"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.info("Refreshing patients...");
                refetch();
              }}
              className="px-4 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--accent)] transition-colors flex items-center space-x-2 cursor-pointer">
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors flex items-center space-x-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PATIENT NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  USER ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  GENDER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  AGE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PHONE NUMBER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  LAST CONSULTATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-[var(--muted-foreground)]">
                      <p className="text-lg font-medium text-[var(--foreground)]">
                        Failed to load patients
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors">
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((patient, index) => (
                  <tr
                    key={index}
                    className="hover:bg-[var(--muted)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/users/patients/${patient.id}`}
                        className="text-[var(--primary)] font-medium hover:text-[var(--primary)]/80 cursor-pointer">
                        {patient.display_name || patient.name || "N/A"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {patient.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {patient.gender || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-full">
                        {patient.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {patient.age || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {patient.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {patient.lastConsultation || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/users/patients/${patient.id}/book-appointment`}
                          className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-sm flex items-center space-x-1 cursor-pointer">
                          <Calendar className="w-3 h-3" />
                          <span>Book Appointment</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <NoRecordFound colSpan={8} />
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

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
