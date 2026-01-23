"use client";
import { useState, useEffect } from "react";
import { Search, Plus, ArrowLeft, Activity } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/Input";
import Breadcrumb from "@/components/Breadcrumb";
import AddPatientModal, { PatientFormData } from "@/components/modals/AddPatientModal";
import Link from "next/link";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Pagination from "@/components/Pagination";
import { auth, createFirebaseDocument, secondaryAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import AddVitalsModal from "@/components/modals/AddVitalsModal";

export default function NursePatientsPage() {
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    gender: "",
    dateOfBirth: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const handleFormChange = (field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      gender: "",
      dateOfBirth: "",
      phone_number: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
    });
  };

  const handleCloseAddModal = () => {
    resetForm();
    setIsAddPatientModalOpen(false);
  };

  const handleSavePatient = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.dateOfBirth ||
      !formData.gender ||
      !formData.address ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsCreating(true);
    try {
      const display_name = `${formData.first_name} ${formData.last_name}`.trim();

      // Use secondaryAuth to create user without signing out the current admin/nurse
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );

      // Force sign out the newly created user from the secondary auth instance
      // so it doesn't persist there (just good hygiene)
      await signOut(secondaryAuth);

      const patientUid = userCredential.user.uid;

      await createFirebaseDocument("users", {
        uid: patientUid,
        email: formData.email,
        display_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: "patient",
        phone_number: formData.phone_number,
        address: formData.address,
        location: formData.address,
        date_of_birth: formData.dateOfBirth,
        photo_url: "",
        isActive: true,
        createdTime: new Date().toISOString(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      await createFirebaseDocument("patientProfiles", {
        patientId: patientUid,
        display_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        address: formData.address,
        location: formData.address,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        hmo: "",
        medical_history: "",
        photo_url: "",
        isActive: true,
        createdTime: new Date().toISOString(),
      });

      // Send verification email or password reset as needed
      // await sendPasswordResetEmail(auth, formData.email);

      toast.success("Patient created successfully");
      handleCloseAddModal();
      refetch();
    } catch (error) {
      console.error("Error creating patient user:", error);

      const backendError =
        typeof error === "object" && error !== null
          ? // RTK Query style error shapes
          // @ts-expect-error runtime error shape
          error.data?.error ||
          // @ts-expect-error runtime error shape
          error.data?.message ||
          // @ts-expect-error runtime error shape
          error.error ||
          // @ts-expect-error runtime error shape
          error.message
          : undefined;

      toast.error(backendError || "Failed to create patient user. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

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
            <Input
              type="text"
              placeholder="Search patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search className="w-5 h-5 text-gray-400" />}
              className="search-input cursor-pointer rounded-md"
              fullWidth
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

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="bg-[#44CE2D] hover:bg-[#3bb025] text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>
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

                              <button
                                onClick={() => {
                                  setSelectedPatientId((patient.uid as string) || patient.id);
                                  setSelectedPatientName((patient.display_name as string) || (patient.name as string) || "Patient");
                                  setIsVitalsModalOpen(true);
                                }}
                                className="bg-[#44CE2D] hover:bg-[#3bb025] text-white px-4 py-1 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors shadow-sm"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Add Vitals</span>
                              </button>
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
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalCount={filteredPatients.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemLabel="patients"
            className="border-t border-gray-200"
          />
        </div>
      )}


      {/* Add New Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={handleCloseAddModal}
        isCreating={isCreating}
        formData={formData}
        onChange={handleFormChange}
        onSave={handleSavePatient}
      />

      {/* Add Vitals Modal */}
      {selectedPatientId && (
        <AddVitalsModal
          isOpen={isVitalsModalOpen}
          onClose={() => {
            setIsVitalsModalOpen(false);
            setSelectedPatientId(null);
            setSelectedPatientName("");
          }}
          patientId={selectedPatientId}
          patientName={selectedPatientName}
        />
      )}
    </div>
  );
}
