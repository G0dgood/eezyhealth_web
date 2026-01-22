"use client";

import { useState } from "react";
import { ArrowLeft, Activity } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/modals/Modal";
import Breadcrumb from "@/components/Breadcrumb";
import AppointmentTabs from "@/components/Tabs/AppointmentTabs";
import Link from "next/link";

export default function NursePatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "past">("incoming");
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Sample appointment data
  const incomingAppointments = [
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "24-05-2024",
      time: "08:30 AM",
      channel: "Chat",
    },
    {
      doctor: "Dr. Tunde Paul",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "14-04-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
    {
      doctor: "Dr. Mary Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "24-03-2024",
      time: "08:30 AM",
      channel: "Voice Call",
    },
  ];

  const pastAppointments = [
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "04-02-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "04-02-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "04-02-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
  ];

  const columns = [
    { key: "doctor", label: "DOCTOR" },
    { key: "specialty", label: "SPECIALTY" },
    { key: "bookingId", label: "BOOKING ID" },
    { key: "date", label: "DATE" },
    { key: "time", label: "TIME" },
    { key: "channel", label: "CHANNEL" },
    {
      key: "action",
      label: "ACTION",
      render: () => (
        <button
          onClick={() => setIsVitalsModalOpen(true)}
          className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
          Vitals
        </button>
      ),
    },
  ];

  const currentData =
    activeTab === "incoming" ? incomingAppointments : pastAppointments;

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse Dashboard", href: "/nurse" },
          { label: "Patients", href: "/nurse/patients" },
          { label: "Appointments" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/nurse/patients"
            className="text-gray-600 hover:text-gray-800 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Seun Simeon</h1>
        </div>

        {/* Tabs */}
        <AppointmentTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Appointments Table */}
      <DataTable
        columns={columns}
        data={currentData}
        currentPage={currentPage}
        totalCount={currentData.length}
        pageSize={10}
        onPageChange={setCurrentPage}
        itemLabel="appointments"
      />

      {/* Vitals Modal */}
      <Modal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        title="Vitals"
        size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">71</div>
              <div className="text-sm text-gray-600">Heart Rate (bpm)</div>
            </div>
            <div className="text-center p-4 bg-gray-50">
              <div className="text-2xl font-bold text-gray-900">120/90</div>
              <div className="text-sm text-gray-600">Blood Pressure (mmHg)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">68</div>
              <div className="text-sm text-gray-600">Weight (kg)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">30</div>
              <div className="text-sm text-gray-600">Temperature (°C)</div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsVitalsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
