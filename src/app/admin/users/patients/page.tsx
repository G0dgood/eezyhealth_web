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
import AddPatientModal, { PatientFormData } from "@/components/modals/AddPatientModal";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";
import { toast } from "sonner";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Pagination from "@/components/Pagination";
import Button from "@/components/Button";
import { auth, createFirebaseDocument, secondaryAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

interface FirebasePatient {
  uid: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  location?: string;
  role: string;
  isActive?: boolean;
  date_of_birth?: string;
  gender?: string;
  photo_url?: string;
  createdTime?: any;
}

interface Patient {
  display_name: string;
  name?: string;
  location: string;
  id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  gender: string;
  age: string | number;
  lastConsultation: string;
  photo_url?: string;
}

const calculateAge = (dobString?: string): string | number => {
  if (!dobString) return "N/A";

  try {
    // Handle "DD/MM/YYYY" format
    const parts = dobString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(parts[2], 10);

      const birthDate = new Date(year, month, day);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return isNaN(age) ? "N/A" : age;
    }

    // Try standard date parsing
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "N/A";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (e) {
    return "N/A";
  }
};

export default function AdminPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    setIsAddModalOpen(false);
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

      // Use secondaryAuth to create user without signing out the current admin
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );

      // Force sign out the newly created user from the secondary auth instance
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

  // Fetch patients from Firebase
  const {
    data: firebasePatients,
    isLoading,
    error,
    refetch,
  } = useGetFirebasePatientsQuery({});

  // Map Firebase data to Patient interface
  const dataSource: Patient[] = useMemo(() => {
    if (!firebasePatients) return [];

    return (firebasePatients as unknown as FirebasePatient[]).map((p) => ({
      id: p.uid,
      display_name:
        p.display_name ||
        `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
        "Unknown",
      name:
        p.display_name ||
        `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
        "Unknown",
      location: p.location || "N/A",
      email: p.email,
      phone: p.phone_number || "N/A",
      role: p.role,
      status: p.isActive ? "Active" : "Inactive",
      gender: p.gender || "N/A",
      age: calculateAge(p.date_of_birth),
      lastConsultation: "N/A", // Placeholder as it's not in user data
      photo_url: p.photo_url,
    }));
  }, [firebasePatients]);

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

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
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

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              variant="neutral"
              onClick={() => {
                toast.info("Refreshing patients...");
                refetch();
              }}
              className="flex-1 md:flex-none"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
              className="flex-1 md:flex-none"
            >
              Add New Patient
            </Button>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg  overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th >
                  PATIENT NAME
                </th>
                {/* <th >
                  USER ID
                </th> */}
                <th >
                  GENDER
                </th>
                <th >
                  STATUS
                </th>
                <th >
                  AGE
                </th>
                <th >
                  PHONE NUMBER
                </th>
                {/* <th >
                  LAST CONSULTATION
                </th> */}
                {/* <th >
                  ACTION
                </th> */}
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
                      <Button
                        variant="primary"
                        onClick={() => refetch()}
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : paginatedData?.length > 0 ? (
                paginatedData?.map((patient, index) => (
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
                    {/* <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-[var(--foreground)]">
                      {patient.id}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-[var(--foreground)]">
                      {patient.gender || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-xs rounded-full">
                        {patient.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-[var(--foreground)]">
                      {patient.age || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-[var(--foreground)]">
                      {patient.phone || "N/A"}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-[var(--foreground)]">
                      {patient.lastConsultation || "N/A"}
                    </td> */}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/users/patients/${patient.id}/book-appointment`}
                          className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-[10px] md:text-[12px] flex items-center space-x-1 cursor-pointer">
                          <Calendar className="w-3 h-3" />
                          <span>Book Appointment</span>
                        </Link>
                      </div>
                    </td> */}
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
          <Pagination
            currentPage={currentPage}
            totalCount={filteredData.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="patients"
            className="mt-4"
          />
        )}
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        isCreating={isCreating}
        formData={formData}
        onChange={handleFormChange}
        onSave={handleSavePatient}
      />
    </div>
  );
}