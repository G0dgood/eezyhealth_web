"use client";

import { SetStateAction, useState } from "react";
import { Search, X } from "lucide-react";
import DataTable from "@/components/DataTable";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import { time } from "console";

export default function NurseBookingCancellationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const totalPages = 10;

  // Sample cancellation data matching the design
  const cancellationsData = [
    {
      doctor: "Dr. Tunde Sim",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "08:30 AM",
      status: "Pending",
    },
    {
      doctor: "Dr. Ernest Sim",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "09:00 AM",
      status: "Approved",
    },
    {
      doctor: "Dr. Godwin Sir",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "10:00 AM",
      status: "Rejected",
    },
    {
      doctor: "Dr. Daniel Simo",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "11:30 AM",
      status: "Pending",
    },
    {
      doctor: "Dr. Seun Sime",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "01:00 PM",
      status: "Approved",
    },
    {
      doctor: "Dr. Felix Simed",
      specialty: "Dentist",
      patientName: "Tina Simeon",

      date: "24-05-2024",
      time: "02:30 PM",
      status: "Pending",
    },
    {
      doctor: "Dr. Kofi Simeo",
      specialty: "Dentist",
      patientName: "Tina Simeon",
      date: "24-05-2024",
      time: "03:00 PM",
      status: "Rejected",
    },
    {
      doctor: "Dr. Fatima Sim",
      specialty: "Dentist",
      patientName: "Tina Simeon",
      date: "24-05-2024",
      time: "04:30 PM",
      status: "Approved",
    },
    {
      doctor: "Dr. Joy Simeon",
      specialty: "Dentist",
      patientName: "Tina Simeon",
      date: "24-05-2024",
      time: "05:00 PM",
      status: "Pending",
    },
    {
      doctor: "Dr. Tolu Simeon",
      specialty: "Dentist",
      patientName: "Tina Simeon",
      date: "24-05-2024",
      time: "06:30 PM",
      status: "Pending",
    },
  ];

  const columns = [
    { key: "doctor", label: "DOCTOR" },
    { key: "specialty", label: "SPECIALTY" },
    { key: "patientName", label: "PATIENT NAME" },
    { key: "date", label: "DATE" },
    { key: "time", label: "TIME" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === "Approved"
              ? "bg-green-100 text-green-800"
              : value === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {String(value)}
        </span>
      ),
    },
    {
      key: "action",
      label: "ACTION",
      render: (value: string | number, row: SetStateAction<null>) => (
        <button
          onClick={() => {
            setSelectedBooking(row);
            setIsCancelModalOpen(true);
          }}
          className="text-green-500 hover:text-green-700 font-medium text-sm cursor-pointer"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse", href: "/nurse" },
          { label: "Booking Cancellation" },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Cancellation
        </h1>
      </div>

      {/* Search Bar */}
      <div className="bp-6 mb-6">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Cancellations Table */}
      <DataTable
        columns={columns}
        // @ts-expect-error - data is not defined in the interface
        data={cancellationsData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />

      {/* Cancellation Details Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title=""
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4">
            {/* Modal content matching the design */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Channel
                </label>
                <p className="text-gray-900">Video Consultation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID
                </label>
                <p className="text-gray-900">086FnyUQIRE23</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-gray-900">N10,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cancellation Reason
                </label>
                <p className="text-gray-900">Emergency surgery scheduled</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                Approve
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
