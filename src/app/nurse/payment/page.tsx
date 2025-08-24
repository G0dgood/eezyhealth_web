"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import DataTable from "@/components/DataTable";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import { Payment } from "@/types";

export default function NursePaymentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const totalPages = 10;

  // Sample payment data
  const paymentsData: Payment[] = [
    {
      patient: "Seun Simeon",
      doctor: "Dr. Tunde Sanni",
      date: "25-05-2024",
      amount: "₦5,000",
      method: "Card",
      status: "Completed",
    },
    {
      patient: "Felix Simeon",
      doctor: "Dr. Mary Paul",
      date: "25-05-2024",
      amount: "₦3,000",
      method: "Bank Transfer",
      status: "Pending",
    },
    {
      patient: "Kofi Simeon",
      doctor: "Dr. Paul Moses",
      date: "25-05-2024",
      amount: "₦4,000",
      method: "Cash",
      status: "Completed",
    },
    {
      patient: "Fatima Simeon",
      doctor: "Dr. Sarah James",
      date: "26-05-2024",
      amount: "₦5,000",
      method: "Card",
      status: "Failed",
    },
    {
      patient: "Joy Simeon",
      doctor: "Dr. Zainab Ali",
      date: "26-05-2024",
      amount: "₦3,000",
      method: "Mobile Money",
      status: "Completed",
    },
  ];

  const columns = [
    {
      key: "patient",
      label: "PATIENT",
      render: (value: string | number) => (
        <span className="text-green-600 font-medium">{String(value)}</span>
      ),
    },
    { key: "doctor", label: "DOCTOR" },
    { key: "date", label: "DATE" },
    { key: "amount", label: "AMOUNT" },
    { key: "method", label: "PAYMENT METHOD" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === "Completed"
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (value: string | number, row: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedPayment(row);
              setIsPaymentModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer">
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        homeHref="/nurse"
        items={[{ label: "Nurse", href: "/nurse" }, { label: "Payment" }]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">Manage patient payments</p>
      </div>

      {/* Search and Actions */}
      <div className=" mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
            />
          </div>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={paymentsData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />

      {/* Payment Details Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Payment Details"
        size="md">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <p className="text-gray-900">{selectedPayment.patient}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <p className="text-gray-900">{selectedPayment.doctor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-gray-900">{selectedPayment.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedPayment.amount}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <p className="text-gray-900">{selectedPayment.method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedPayment.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : selectedPayment.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {selectedPayment.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
