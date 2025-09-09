"use client";

import { useState } from "react";
import { Calendar, Filter, Plus, Search } from "lucide-react";
import DataTable from "@/components/DataTable";

export default function NurseAppointmentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const totalPages = 10;

  // Sample appointments data
  const appointmentsData = [
    {
      patient: "Seun Simeon",
      doctor: "Dr. Tunde Sanni",
      date: "24-05-2024",
      time: "08:30 AM",
      type: "Video Consultation",
      status: "Confirmed",
    },
    {
      patient: "Felix Simeon",
      doctor: "Dr. Mary Paul",
      date: "24-05-2024",
      time: "10:00 AM",
      type: "Chat Consultation",
      status: "Pending",
    },
    {
      patient: "Kofi Simeon",
      doctor: "Dr. Paul Moses",
      date: "24-05-2024",
      time: "02:00 PM",
      type: "Voice Call",
      status: "Confirmed",
    },
    {
      patient: "Fatima Simeon",
      doctor: "Dr. Tunde Sanni",
      date: "25-05-2024",
      time: "09:00 AM",
      type: "Video Consultation",
      status: "Confirmed",
    },
    {
      patient: "Joy Simeon",
      doctor: "Dr. Mary Sanni",
      date: "25-05-2024",
      time: "11:30 AM",
      type: "Chat Consultation",
      status: "Pending",
    },
  ];

  const columns = [
    { key: "patient", label: "PATIENT" },
    { key: "doctor", label: "DOCTOR" },
    { key: "date", label: "DATE" },
    { key: "time", label: "TIME" },
    { key: "type", label: "TYPE" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value === "Confirmed"
              ? "bg-green-100 text-green-800"
              : value === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">
          Manage and schedule patient appointments
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <DataTable
        columns={columns}
        data={appointmentsData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-blue-600">5</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Confirmations</p>
              <p className="text-2xl font-bold text-yellow-600">2</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
