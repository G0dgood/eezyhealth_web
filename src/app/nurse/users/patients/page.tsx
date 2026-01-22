"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  ArrowLeft,
  Filter,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import Breadcrumb from "@/components/Breadcrumb";
import {
  showSuccess,
  showError,
  showLoading,
  dismissLoading,
} from "@/utils/toast";
import Link from "next/link";
import {
  searchPatients,
  getPatientsPaginated,
  PatientSearchFilters,
  PatientSearchResult,
} from "@/hooks/searchPatients";
import Input from "@/components/Input";
import { createPatient, CreatePatientData } from "@/hooks/createPatient";
import { updatePatient, UpdatePatientData } from "@/hooks/updatePatient";
import { deletePatient } from "@/hooks/deletePatient";
import Title from "@/components/Title";

export default function NurseUsersPatientsPage() {
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [isDeletePatientModalOpen, setIsDeletePatientModalOpen] =
    useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] =
    useState<PatientSearchResult | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [filters, setFilters] = useState<PatientSearchFilters>({});

  // Form state for add/edit patient
  const [formData, setFormData] = useState<CreatePatientData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    medicalHistory: [],
    allergies: [],
    bloodType: "",
    height: undefined,
    weight: undefined,
  });

  const [, setFormErrors] = useState<Partial<CreatePatientData>>({});

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getPatientsPaginated(currentPage, 20, filters);
      setPatients(result.patients);
      setTotalPages(result.pagination.totalPages);
      setTotalPatients(result.pagination.totalPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showError("Error", "Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  // Fetch patients on component mount and when filters change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Search patients
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilters({});
      return;
    }

    try {
      setIsLoading(true);
      const searchFilters: PatientSearchFilters = {
        name: searchTerm,
        limit: 50,
      };

      const result = await searchPatients(searchFilters);
      setPatients(result.patients);
      setTotalPages(Math.ceil(result.patients.length / 20));
      setTotalPatients(result.patients.length);
    } catch (error) {
      console.error("Error searching patients:", error);
      showError("Error", "Failed to search patients");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      fetchPatients();
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "male",
      address: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      medicalHistory: [],
      allergies: [],
      bloodType: "",
      height: undefined,
      weight: undefined,
    });
    setFormErrors({});
  };

  // Open add patient modal
  const openAddPatientModal = () => {
    resetForm();
    setIsAddPatientModalOpen(true);
  };

  // Open edit patient modal
  const openEditPatientModal = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      address: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      medicalHistory: [],
      allergies: [],
      bloodType: patient.bloodType || "",
      height: undefined,
      weight: undefined,
    });
    setIsEditPatientModalOpen(true);
  };

  // Open delete patient modal
  const openDeletePatientModal = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setIsDeletePatientModalOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CreatePatientData> = {};

    if (!formData.name.trim()) {
      errors.name = "Patient name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save patient (add or edit)
  const handleSavePatient = async () => {
    if (!validateForm()) {
      return;
    }

    const loadingToast = showLoading(
      isEditPatientModalOpen ? "Updating patient..." : "Saving patient..."
    );

    try {
      if (isEditPatientModalOpen && selectedPatient) {
        // Update existing patient
        const updateData: UpdatePatientData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodType: formData.bloodType,
        };

        await updatePatient(selectedPatient.id, updateData);
        showSuccess(
          "Patient Updated",
          "Patient information has been updated successfully"
        );
      } else {
        // Create new patient
        await createPatient(formData);
        showSuccess("Patient Saved", "New patient has been added successfully");
      }

      dismissLoading(loadingToast as string);

      // Close modal and refresh data
      setIsAddPatientModalOpen(false);
      setIsEditPatientModalOpen(false);
      resetForm();
      fetchPatients();
    } catch {
      dismissLoading(loadingToast as string);
      showError("Save Failed", "Failed to save patient. Please try again.");
    }
  };

  // Handle delete patient
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    const loadingToast = showLoading("Deleting patient...");

    try {
      await deletePatient(selectedPatient.id);
      dismissLoading(loadingToast as string);
      showSuccess("Patient Deleted", "Patient has been deleted successfully");

      setIsDeletePatientModalOpen(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch {
      dismissLoading(loadingToast as string);
      showError("Delete Failed", "Failed to delete patient. Please try again.");
    }
  };

  // Apply filters
  const applyFilters = (newFilters: PatientSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const columns = [
    {
      key: "name",
      label: "PATIENT NAME",
      render: (value: string | number, row: PatientSearchResult) => (
        <Link
          href={`/nurse/users/patients/${row.id}`}
          className="text-[#44CE2D] font-medium hover:text-[#3bb025] cursor-pointer"
        >
          {String(value)}
        </Link>
      ),
    },
    {
      key: "userId",
      label: "USER ID",
      render: (value: string | number, row: PatientSearchResult) => row.id,
    },
    {
      key: "gender",
      label: "GENDER",
      render: (value: string | number) =>
        String(value).charAt(0).toUpperCase() + String(value).slice(1),
    },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <span className="px-2 py-1 bg-[#44CE2D]/10 text-[#44CE2D] text-xs rounded-full">
          {String(value)}
        </span>
      ),
    },
    { key: "age", label: "AGE" },
    { key: "phone", label: "PHONE NUMBER" },
    { key: "email", label: "EMAIL" },
    {
      key: "action",
      label: "ACTION",
      render: (value: string | number, row: PatientSearchResult) => (
        <div className="flex space-x-2">
          <Link
            href={`/nurse/users/patients/${row.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </Link>
          <button
            onClick={() => openEditPatientModal(row)}
            className="text-[#44CE2D] hover:text-[#3bb025] font-medium text-sm flex items-center space-x-1 cursor-pointer"
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => openDeletePatientModal(row)}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      ),
    },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse", href: "/nurse" },
          { label: "Users", href: "/nurse/users" },
          { label: "Patients" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/nurse"
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Title title="Patient Management" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search patient by name, email, or phone"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                icon={<Search className="w-5 h-5 text-gray-400" />}
                fullWidth
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          <button
            onClick={openAddPatientModal}
            className="ml-4 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>
        </div>

        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {patients.length} of {totalPatients} patients
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 text-[#44CE2D]">(Filtered results)</span>
          )}
        </div>
      </div>

      {/* Patients Table */}
      <DataTable
        columns={columns}
        data={patients}
        currentPage={currentPage}
        totalCount={totalPatients}
        pageSize={20}
        onPageChange={setCurrentPage}
        itemLabel="patients"
      />

      {/* Add/Edit Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen || isEditPatientModalOpen}
        onClose={() => {
          setIsAddPatientModalOpen(false);
          setIsEditPatientModalOpen(false);
          resetForm();
        }}
        title={isEditPatientModalOpen ? "Edit Patient" : "Add New Patient"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Name"
              placeholder="Enter patient fullname"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />

            <FormSelect
              label="Gender"
              options={genderOptions}
              placeholder="Select Gender"
              value={formData.gender}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  gender: value as "male" | "female",
                })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Date of Birth"
              type="date"
              placeholder="dd/mm/yy"
              value={formData.dateOfBirth}
              onChange={(value) =>
                setFormData({ ...formData, dateOfBirth: value })
              }
              required
            />

            <FormSelect
              label="Blood Type"
              options={bloodTypeOptions}
              placeholder="Select Blood Type"
              value={formData.bloodType}
              onChange={(value) =>
                setFormData({ ...formData, bloodType: value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Phone Number"
              type="tel"
              placeholder="Enter patient number"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              placeholder="Enter patient email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              required
            />
          </div>

          <FormInput
            label="Address"
            placeholder="Enter patient address"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
          />

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Name"
                placeholder="Emergency contact name"
                value={formData.emergencyContact?.name || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      name: value,
                      phone: formData.emergencyContact?.phone || "",
                      relationship:
                        formData.emergencyContact?.relationship || "",
                    },
                  })
                }
              />
              <FormInput
                label="Phone"
                placeholder="Emergency contact phone"
                value={formData.emergencyContact?.phone || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      name: formData.emergencyContact?.name || "",
                      phone: value,
                      relationship:
                        formData.emergencyContact?.relationship || "",
                    },
                  })
                }
              />
              <FormInput
                label="Relationship"
                placeholder="Relationship to patient"
                value={formData.emergencyContact?.relationship || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      name: formData.emergencyContact?.name || "",
                      phone: formData.emergencyContact?.phone || "",
                      relationship: value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setIsAddPatientModalOpen(false);
                setIsEditPatientModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePatient}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors cursor-pointer"
            >
              {isEditPatientModalOpen ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Patient Confirmation Modal */}
      <Modal
        isOpen={isDeletePatientModalOpen}
        onClose={() => {
          setIsDeletePatientModalOpen(false);
          setSelectedPatient(null);
        }}
        title="Delete Patient"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {selectedPatient?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setIsDeletePatientModalOpen(false);
                setSelectedPatient(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePatient}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Patients"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
              placeholder="Select Status"
              value={filters.status || ""}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  status: value as "ACTIVE" | "INACTIVE" | "SUSPENDED",
                })
              }
            />

            <FormSelect
              label="Gender"
              options={genderOptions}
              placeholder="Select Gender"
              value={filters.gender || ""}
              onChange={(value) =>
                setFilters({ ...filters, gender: value as "male" | "female" })
              }
            />
          </div>

          <FormSelect
            label="Blood Type"
            options={bloodTypeOptions}
            placeholder="Select Blood Type"
            value={filters.bloodType || ""}
            onChange={(value) => setFilters({ ...filters, bloodType: value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => applyFilters(filters)}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
