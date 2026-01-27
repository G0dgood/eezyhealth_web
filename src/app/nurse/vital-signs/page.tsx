"use client";

import { useState } from "react";
import Input from "@/components/Input";
import {
  Activity,
  Plus,
  Search,
  TrendingUp,
  Heart,
  Thermometer,
  Scale,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";

export default function NurseVitalSignsPage() {
  const [isAddVitalsModalOpen, setIsAddVitalsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const totalPages = 10;

  // Sample vital signs data
  const vitalsData = [
    {
      patient: "Seun Simeon",
      heartRate: "71 bpm",
      bloodPressure: "120/90 mmHg",
      weight: "68 kg",
      temperature: "30 °C",
      date: "24-05-2024",
      time: "08:30 AM",
    },
    {
      patient: "Felix Simeon",
      heartRate: "75 bpm",
      bloodPressure: "118/85 mmHg",
      weight: "72 kg",
      temperature: "29.5 °C",
      date: "24-05-2024",
      time: "10:00 AM",
    },
    {
      patient: "Kofi Simeon",
      heartRate: "68 bpm",
      bloodPressure: "125/92 mmHg",
      weight: "65 kg",
      temperature: "30.2 °C",
      date: "24-05-2024",
      time: "02:00 PM",
    },
    {
      patient: "Fatima Simeon",
      heartRate: "82 bpm",
      bloodPressure: "130/95 mmHg",
      weight: "78 kg",
      temperature: "29.8 °C",
      date: "23-05-2024",
      time: "09:00 AM",
    },
  ];

  const columns = [
    { key: "patient", label: "PATIENT" },
    { key: "heartRate", label: "HEART RATE" },
    { key: "bloodPressure", label: "BLOOD PRESSURE" },
    { key: "weight", label: "WEIGHT" },
    { key: "temperature", label: "TEMPERATURE" },
    { key: "date", label: "DATE" },
    { key: "time", label: "TIME" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2">Vital Signs</h1>
        <p className="text-gray-600">Monitor and record patient vital signs</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search patient vitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
            fullWidth
          />
        </div>

        <button
          onClick={() => setIsAddVitalsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Record Vitals</span>
        </button>
      </div>

      {/* Vital Signs Table */}
      <DataTable
        columns={columns}
        data={vitalsData}
        currentPage={currentPage}
        totalCount={vitalsData.length}
        pageSize={10}
        onPageChange={setCurrentPage}
        itemLabel="vital signs"
      />

      {/* Vital Signs Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-[12px] text-gray-600">Average Heart Rate</p>
              <p className="text-[18px] md:text-[20px] font-bold text-red-600">74 bpm</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-[12px] text-gray-600">Average BP</p>
              <p className="text-[18px] md:text-[20px] font-bold text-blue-600">123/91</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-[12px] text-gray-600">Average Weight</p>
              <p className="text-[18px] md:text-[20px] font-bold text-green-600">71 kg</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-[12px] text-gray-600">Average Temp</p>
              <p className="text-[18px] md:text-[20px] font-bold text-orange-600">29.9 °C</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Record Vitals Modal */}
      <Modal
        isOpen={isAddVitalsModalOpen}
        onClose={() => setIsAddVitalsModalOpen(false)}
        title="Record Vital Signs"
        size="md">
        <div className="space-y-4">
          <FormInput
            label="Patient Name"
            placeholder="Enter patient name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Heart Rate" placeholder="bpm" required />
            <FormInput label="Blood Pressure" placeholder="mmHg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Weight" placeholder="kg" required />
            <FormInput label="Temperature" placeholder="°C" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Date" type="date" required />
            <FormInput label="Time" type="time" required />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddVitalsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Save Vitals
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
