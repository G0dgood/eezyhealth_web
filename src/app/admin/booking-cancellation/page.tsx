"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import DataTable from "@/components/DataTable";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";

export default function AdminBookingCancellationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const totalPages = 10;

  // Sample cancellation data matching the design
  const cancellationsData = [
    {
      doctor: "Dr. Tunde Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Ernest Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Godwin Sir",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Rejected",
    },
    {
      doctor: "Dr. Daniel Simo",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Seun Sime",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Felix Simed",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Kofi Simeo",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Rejected",
    },
    {
      doctor: "Dr. Fatima Sim",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Approved",
    },
    {
      doctor: "Dr. Joy Simeon",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      doctor: "Dr. Tolu Simeon",
      patientName: "Tina Simeon",
      userId: "uPBYpITyJBafDtk086FnyUQIRE23",
      date: "24-05-2024",
      status: "Pending",
    },
  ];

  const columns = [
    { key: "doctor", label: "DOCTOR" },
    { key: "patientName", label: "PATIENT NAME" },
    { key: "userId", label: "USER ID" },
    { key: "date", label: "DATE" },
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
          }`}>
          {String(value)}
        </span>
      ),
    },
    {
      key: "action",
      label: "ACTION",
      render: (value: string | number, row: any) => (
        <button
          onClick={() => {
            setSelectedBooking(row);
            setIsCancelModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer">
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
          { label: "Admin", href: "/admin" },
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
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
        size="md">
        {selectedBooking && (
          <div className="space-y-4">
            {/* Close button at top right */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

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
