"use client";

import { useState } from "react";
import { Eye, FileText, Calendar, Plus } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";
import AddPatientModal from "@/components/modals/AddPatientModal";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment?: string;
  status: "active" | "inactive";
}

const mockData: Patient[] = [
  {
    id: "1",
    name: "John Doe",
    age: 35,
    gender: "Male",
    phone: "+234 801 234 5678",
    email: "john.doe@email.com",
    lastVisit: "15 January 2025",
    nextAppointment: "22 January 2025",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    age: 28,
    gender: "Female",
    phone: "+234 802 345 6789",
    email: "sarah.j@email.com",
    lastVisit: "12 January 2025",
    nextAppointment: "25 January 2025",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Brown",
    age: 45,
    gender: "Male",
    phone: "+234 803 456 7890",
    email: "michael.b@email.com",
    lastVisit: "10 January 2025",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    age: 32,
    gender: "Female",
    phone: "+234 804 567 8901",
    email: "emily.d@email.com",
    lastVisit: "8 January 2025",
    nextAppointment: "20 January 2025",
    status: "active",
  },
  {
    id: "5",
    name: "David Wilson",
    age: 39,
    gender: "Male",
    phone: "+234 805 678 9012",
    email: "david.w@email.com",
    lastVisit: "5 January 2025",
    status: "inactive",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    age: 26,
    gender: "Female",
    phone: "+234 806 789 0123",
    email: "lisa.a@email.com",
    lastVisit: "3 January 2025",
    nextAppointment: "18 January 2025",
    status: "active",
  },
  {
    id: "7",
    name: "Robert Taylor",
    age: 52,
    gender: "Male",
    phone: "+234 807 890 1234",
    email: "robert.t@email.com",
    lastVisit: "1 January 2025",
    nextAppointment: "24 January 2025",
    status: "active",
  },
  {
    id: "8",
    name: "Jennifer Martinez",
    age: 29,
    gender: "Female",
    phone: "+234 808 901 2345",
    email: "jennifer.m@email.com",
    lastVisit: "30 December 2024",
    status: "inactive",
  },
];

export default function DoctorPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  const filteredData = mockData.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "inactive":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleViewPatient = (patientId: string) => {
    console.log("Viewing patient:", patientId);
    // Navigate to patient details page
  };

  const handleViewRecords = (patientId: string) => {
    console.log("Viewing medical records for patient:", patientId);
    // Navigate to medical records page
  };

  const handleScheduleAppointment = (patientId: string) => {
    console.log("Scheduling appointment for patient:", patientId);
    // Navigate to appointment scheduling page
  };

  function handleAddPatient(patientData: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <Title title="Patient Management" />

      {/* Search Bar */}
      <div className="mb-6 flex justify-between">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search patients by name, email, or phone..."
        />
        <button
          onClick={() => setIsAddPatientModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PATIENT NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  AGE/GENDER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  CONTACT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  LAST VISIT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  NEXT APPOINTMENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {isLoading ? (
                <SVGLoaderFetch colSpan={5} text={""} />
              ) : paginatedData?.length === 0 ||
                paginatedData?.length === undefined ? (
                <NoRecordFound colSpan={5} />
              ) : (
                paginatedData.map((patient) => (
                  <tr key={patient.id} className="hover:bg-[var(--muted)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {patient.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {patient.age} • {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]">
                        {patient.phone}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {patient.lastVisit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {patient.nextAppointment || "No upcoming"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(patient.status)}>
                        {patient.status.charAt(0).toUpperCase() +
                          patient.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Patient"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewRecords(patient.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Medical Records"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleScheduleAppointment(patient.id)}
                          className="p-2 text-[#44CE2D] hover:bg-green-50 rounded-lg transition-colors"
                          title="Schedule Appointment"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onAdd={(patientData) => handleAddPatient(patientData)}
      />

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-[var(--muted-foreground)]">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-white bg-[#44CE2D] rounded-lg hover:bg-[#3bb025] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
