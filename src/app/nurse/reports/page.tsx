"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Activity,
  Clock,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import Dropdown from "@/components/Dropdown";

export default function NurseReportsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState("patient-care");
  const totalPages = 10;

  // Sample reports data
  const reportsData = [
    {
      reportName: "Daily Patient Care Summary",
      type: "Patient Care",
      date: "24-05-2024",
      status: "Generated",
      size: "2.3 MB",
    },
    {
      reportName: "Weekly Vital Signs Report",
      type: "Vital Signs",
      date: "23-05-2024",
      status: "Generated",
      size: "1.8 MB",
    },
    {
      reportName: "Monthly Appointment Statistics",
      type: "Appointments",
      date: "22-05-2024",
      status: "Generated",
      size: "3.1 MB",
    },
    {
      reportName: "Patient Progress Report",
      type: "Patient Care",
      date: "21-05-2024",
      status: "Pending",
      size: "1.5 MB",
    },
  ];

  const columns = [
    { key: "reportName", label: "REPORT NAME" },
    { key: "type", label: "TYPE" },
    { key: "date", label: "DATE" },
    {
      key: "status",
      label: "STATUS",
      render: (
        value: string | number,
        row: {
          reportName: string;
          type: string;
          date: string;
          status: string;
          size: string;
        }
      ) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${value === "Generated"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
            }`}>
          {value}
        </span>
      ),
    },
    { key: "size", label: "SIZE" },
    {
      key: "action",
      label: "ACTION",
      render: (
        value: string | number,
        row: {
          reportName: string;
          type: string;
          date: string;
          status: string;
          size: string;
        }
      ) => (
        <button className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1">
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      ),
    },
  ];

  const reportTypes = [
    { id: "patient-care", label: "Patient Care", icon: Users },
    { id: "vital-signs", label: "Vital Signs", icon: Activity },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate and view healthcare reports and analytics
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-3">
          Report Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 border-2 rounded-lg transition-colors ${selectedReport === type.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}>
                <div className="text-center">
                  <Icon
                    className={`w-8 h-8 mx-auto mb-2 ${selectedReport === type.id
                      ? "text-green-600"
                      : "text-gray-600"
                      }`}
                  />
                  <span
                    className={` !text-[10px]  !md:text-[12px] font-medium ${selectedReport === type.id
                      ? "text-green-700"
                      : "text-gray-700"
                      }`}>
                    {type.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Reports Generated</p>
              <p className="text-[18px] md:text-[20px] font-bold text-blue-600">24</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">This Month</p>
              <p className="text-[18px] md:text-[20px] font-bold text-green-600">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Pending Reports</p>
              <p className="text-[18px] md:text-[20px] font-bold text-orange-600">3</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Total Size</p>
              <p className="text-[18px] md:text-[20px] font-bold text-purple-600">45 MB</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900">Recent Reports</h3>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <DataTable
        columns={columns}
        data={reportsData}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={10}
        onPageChange={setCurrentPage}
        itemLabel="reports"
      />

      {/* Report Generation Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-8">
        <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-4">
          Generate New Report
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <Dropdown
              options={[
                { value: "", label: "Select Report Type" },
                { value: "Patient Care Summary", label: "Patient Care Summary" },
                { value: "Vital Signs Report", label: "Vital Signs Report" },
                { value: "Appointment Statistics", label: "Appointment Statistics" },
                { value: "Performance Metrics", label: "Performance Metrics" },
              ]}
              placeholder="Select Report Type"
              className="w-full"
              variant="default"
            />
          </div>
          <div>
            <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <Dropdown
              options={[
                { value: "Last 7 days", label: "Last 7 days" },
                { value: "Last 30 days", label: "Last 30 days" },
                { value: "Last 3 months", label: "Last 3 months" },
                { value: "Custom range", label: "Custom range" },
              ]}
              placeholder="Last 7 days"
              className="w-full"
              variant="default"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
