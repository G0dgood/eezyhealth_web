"use client";
import { useState, useEffect } from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "@/components/Breadcrumb";
import AddPatientModal from "@/components/modals/AddPatientModal";
import Link from "next/link";
import { useGetFirebasePatientsQuery } from "@/store/api";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";

export default function NursePatientsPage() {
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Use RTK query to fetch patients
  const {
    data: patientsData,
    isLoading,
    error,
    refetch,
  } = useGetFirebasePatientsQuery({});

  // Fallback sample data for testing (remove this in production)
  // Use Firebase data if available, otherwise fall back to sample data
  const dataSource = patientsData;

  // Filter patients based on search term
  const filteredPatients =
    dataSource?.filter(
      (patient: Record<string, unknown> & { id: string }) =>
        ((patient.display_name as string) || (patient.name as string))
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient.email as string)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (patient.phone_number as string)?.includes(searchTerm)
    ) || [];

  const totalPages = Math.ceil((filteredPatients.length || 0) / 10);

  // Handle errors and success with Sonner toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load patients", {
        description:
          "Please try again or contact support if the problem persists.",
        action: {
          label: "Retry",
          onClick: () => {
            toast.loading("Refreshing patients...");
            refetch();
          },
        },
        duration: 10000, // 10 seconds to give user time to retry
      });
    }
  }, [error, refetch]);

  // Show info toast when search is performed
  useEffect(() => {
    if (searchTerm && filteredPatients.length > 0) {
      toast.info(
        `Found ${filteredPatients.length} patients matching "${searchTerm}"`
      );
    } else if (searchTerm && filteredPatients.length === 0) {
      toast.warning(`No patients found matching "${searchTerm}"`);
    }
  }, [searchTerm, filteredPatients.length]);

  // Show info toast when page changes
  useEffect(() => {
    if (currentPage > 1) {
      toast.info(`Showing page ${currentPage} of ${totalPages}`);
    }
  }, [currentPage, totalPages]);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse Dashboard", href: "/nurse" },
          { label: "Patients" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <Title title="Patient Management" />

        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none cursor-pointer"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  toast.info("Search cleared");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="btn-primary-green px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div> */}
        </div>
      </div>

      {/* Patients Table */}
      {isLoading ? (
        <TableSkeleton
          columns={6}
          rows={5}
          headerLabels={[
            "Patient Info",
            "Contact",
            "Demographics",
            "Location",
            "Status",
            "Actions",
          ]}
        />
      ) : (
        <div className="table-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Patient Info</th>
                  <th>Contact</th>
                  <th>Demographics</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients?.length === 0 ||
                  filteredPatients?.length === undefined ? (
                  <NoRecordFound colSpan={6} />
                ) : (
                  filteredPatients?.map(
                    (patient: Record<string, unknown> & { id: string }) => {
                      return (
                        <tr key={patient.id} className="table-row-hover">
                          {/* Patient Info Column */}
                          <td>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {patient.photo_url ? (
                                  <img
                                    src={patient.photo_url as string}
                                    alt={
                                      (patient.display_name as string) ||
                                      "Patient"
                                    }
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="avatar-green h-10 w-10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      {(
                                        (patient.display_name as string) ||
                                        (patient.name as string)
                                      )
                                        ?.charAt(0)
                                        ?.toUpperCase() || "P"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {(patient.display_name as string) ||
                                    (patient.name as string) ||
                                    "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {patient.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Column */}
                          <td>
                            <div className="text-sm text-gray-900">
                              {(patient.email as string) || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(patient.phone_number as string) || "N/A"}
                            </div>
                          </td>

                          {/* Demographics Column */}
                          <td>
                            <div className="text-sm text-gray-900">
                              Age:{" "}
                              {(() => {
                                const birthDate =
                                  patient.date_of_birth || patient.dateOfBirth;
                                if (!birthDate) return "N/A";
                                try {
                                  const birthDateObj = new Date(
                                    birthDate as string
                                  );
                                  const today = new Date();
                                  let age =
                                    today.getFullYear() -
                                    birthDateObj.getFullYear();
                                  const monthDiff =
                                    today.getMonth() - birthDateObj.getMonth();
                                  if (
                                    monthDiff < 0 ||
                                    (monthDiff === 0 &&
                                      today.getDate() < birthDateObj.getDate())
                                  ) {
                                    age--;
                                  }
                                  return age.toString();
                                } catch (error) {
                                  return "N/A";
                                }
                              })()}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {(patient.gender as string) || "N/A"}
                            </div>
                          </td>

                          {/* Location Column */}
                          <td>
                            <div className="text-sm text-gray-900">
                              {(patient.address as string) || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(patient.city as string) || "N/A"}
                            </div>
                          </td>

                          {/* Status Column */}
                          <td>
                            <div className="text-sm text-gray-900">
                              {(patient.status as string) || "Active"}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td>
                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/nurse/patients/appointments?patient=${encodeURIComponent(
                                  (patient?.display_name as string) ||
                                  (patient?.name as string) ||
                                  patient?.id
                                )}&patientId=${patient?.uid || patient?.id}`}
                                onClick={() =>
                                  toast.info(
                                    `Viewing appointments for ${(patient?.display_name as string) ||
                                    (patient.name as string) ||
                                    "patient"
                                    }`
                                  )
                                }
                                className="link-green flex items-center space-x-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Appointments</span>
                              </Link>

                              <Link
                                href={`/nurse/patients/doctors?patient=${encodeURIComponent(
                                  (patient?.display_name as string) ||
                                  (patient?.name as string) ||
                                  patient?.id
                                )}&patientId=${patient?.uid || patient.id}`}
                                onClick={() =>
                                  toast.info(
                                    `Selecting doctor for ${(patient?.display_name as string) ||
                                    (patient?.name as string) ||
                                    "patient"
                                    }`
                                  )
                                }
                                className="link-green flex items-center space-x-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span className="whitespace-nowrap">
                                  Select Doctor
                                </span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="pagination-btn px-3 py-2 text-sm font-medium text-gray-500 bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>Showing page</span>
              <span className="font-medium">{currentPage}</span>
              <span>of</span>
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSuccess={() => {
          // Refetch patients data after successful addition
          refetch();
        }}
      />
    </div>
  );
}
