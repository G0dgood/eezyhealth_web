"use client";

import { useState } from "react";
import { Search, Plus, ArrowLeft, Calendar } from "lucide-react";
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

export default function NurseUsersPatientsPage() {
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const totalPages = 10;

  // Sample patient data
  const patientsData = [
    {
      name: "Seun Simeon",
      userId: "86FnyUQIRE23",
      gender: "Female",
      status: "Active",
      age: 32,
      phone: "08023456789",
      lastConsultation: "24 May 2024 8:00AM",
    },
    {
      name: "Felix Simeon",
      userId: "86FnyUQIRE23",
      gender: "Male",
      status: "Active",
      age: 43,
      phone: "08023456789",
      lastConsultation: "23 May 2024 8:00AM",
    },
    {
      name: "Kofi Simeon",
      userId: "86FnyUQIRE23",
      gender: "Female",
      status: "Active",
      age: 33,
      phone: "08023456789",
      lastConsultation: "23 May 2024 8:00AM",
    },
    {
      name: "Fatima Simeon",
      userId: "86FnyUQIRE23",
      gender: "Male",
      status: "Active",
      age: 54,
      phone: "08023456789",
      lastConsultation: "23 May 2024 8:00AM",
    },
    {
      name: "Joy Simeon",
      userId: "86FnyUQIRE23",
      gender: "Female",
      status: "Active",
      age: 23,
      phone: "08023456789",
      lastConsultation: "23 May 2024 8:00AM",
    },
    {
      name: "Tolu Simeon",
      userId: "86FnyUQIRE23",
      gender: "Male",
      status: "Active",
      age: 65,
      phone: "08023456789",
      lastConsultation: "23 May 2024 8:00AM",
    },
  ];

  const columns = [
    {
      key: "name",
      label: "PATIENT NAME",
      render: (value: string | number, row: (typeof patientsData)[0]) => (
        <Link
          href={`/nurse/users/patients/${row.userId}`}
          className="text-green-600 font-medium hover:text-green-700 cursor-pointer">
          {String(value)}
        </Link>
      ),
    },
    { key: "userId", label: "USER ID" },
    { key: "gender", label: "GENDER" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          {String(value)}
        </span>
      ),
    },
    { key: "age", label: "AGE" },
    { key: "phone", label: "PHONE NUMBER" },
    { key: "lastConsultation", label: "LAST CONSULTATION" },
    {
      key: "action",
      label: "ACTION",
      render: (value: string | number, row: (typeof patientsData)[0]) => (
        <div className="flex space-x-2">
          <Link
            href="/nurse/users/patients/book-appointment"
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 cursor-pointer">
            <Calendar className="w-3 h-3" />
            <span>Book Appointment</span>
          </Link>
        </div>
      ),
    },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const handleSavePatient = async () => {
    const loadingToast = showLoading("Saving patient...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      dismissLoading(loadingToast as string);
      showSuccess("Patient Saved", "New patient has been added successfully");
      setIsAddPatientModalOpen(false);
    } catch (error) {
      dismissLoading(loadingToast as string);
      showError("Save Failed", "Failed to save patient. Please try again.");
    }
  };

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
            className="text-gray-600 hover:text-gray-800 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Management
          </h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsAddPatientModalOpen(true)}
            className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <DataTable
        columns={columns}
        data={patientsData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />

      {/* Add New Patient Modal */}
      <Modal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        title="Add New Patient"
        size="md">
        <div className="space-y-4">
          <FormInput
            label="Name"
            placeholder="Enter patient fullname"
            required
          />

          <FormSelect
            label="Gender"
            options={genderOptions}
            placeholder="Select Gender"
            required
          />

          <FormInput
            label="Date of Birth"
            type="date"
            placeholder="dd/mm/yy"
            required
          />

          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="Enter patient number"
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter patient email"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddPatientModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSavePatient}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
