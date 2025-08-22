"use client";

import { useState } from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Bell,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function DoctorDashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // Sample data for today's appointments
  const todaysAppointments = [
    {
      patient: "Sarah Johnson",
      time: "09:00 AM",
      status: "Confirmed",
      type: "Video",
      specialization: "Cardiology",
    },
    {
      patient: "Michael Chen",
      time: "10:30 AM",
      status: "Pending",
      type: "In-Person",
      specialization: "Dermatology",
    },
    {
      patient: "Emma Wilson",
      time: "02:00 PM",
      status: "Confirmed",
      type: "Call",
      specialization: "ENT",
    },
    {
      patient: "David Brown",
      time: "03:30 PM",
      status: "Pending",
      type: "Video",
      specialization: "Cardiology",
    },
  ];

  // Sample data for recent patients
  const recentPatients = [
    {
      name: "Sarah Johnson",
      age: 28,
      lastVisit: "2 days ago",
      nextAppointment: "Today, 09:00 AM",
      status: "Active",
      condition: "Hypertension",
    },
    {
      name: "Michael Chen",
      age: 35,
      lastVisit: "1 week ago",
      nextAppointment: "Today, 10:30 AM",
      status: "Active",
      condition: "Dermatitis",
    },
    {
      name: "Emma Wilson",
      age: 42,
      lastVisit: "3 days ago",
      nextAppointment: "Today, 02:00 PM",
      status: "Active",
      condition: "Sinusitis",
    },
  ];

  // Sample data for medical records
  const medicalRecords = [
    {
      patient: "Sarah Johnson",
      recordType: "Lab Results",
      date: "Today",
      status: "New",
      priority: "High",
    },
    {
      patient: "Michael Chen",
      recordType: "X-Ray Report",
      date: "Yesterday",
      status: "Reviewed",
      priority: "Medium",
    },
    {
      patient: "Emma Wilson",
      recordType: "Blood Test",
      date: "2 days ago",
      status: "Pending",
      priority: "Low",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Reviewed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Video":
        return "bg-blue-100 text-blue-800";
      case "In-Person":
        return "bg-purple-100 text-purple-800";
      case "Call":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Patients */}
        <div className="bg-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Patients
              </p>
              <p className="text-3xl font-bold">89</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Today&apos;s Appointments
              </p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <Calendar className="w-12 h-12 text-green-200" />
          </div>
        </div>

        {/* Pending Consultations */}
        <div className="bg-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">
                Pending Consultations
              </p>
              <p className="text-3xl font-bold">5</p>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Medical Records
              </p>
              <p className="text-3xl font-bold">23</p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/doctor/patients"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">
              View Patients
            </span>
          </Link>
          <Link
            href="/doctor/appointments"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">
              Manage Appointments
            </span>
          </Link>
          <Link
            href="/doctor/medical-records"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">
              Medical Records
            </span>
          </Link>
          <Link
            href="/doctor/availability"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-center">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-700">
              Set Availability
            </span>
          </Link>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Today&apos;s Appointments
              </h3>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
                <Link
                  href="/doctor/appointments"
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">View All</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todaysAppointments.map((appointment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.patient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          appointment.status
                        )}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          appointment.type
                        )}`}>
                        {appointment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.specialization}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Patients
              </h3>
              <Link
                href="/doctor/patients"
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 cursor-pointer">
                <Eye className="w-4 h-4" />
                <span className="text-sm">View All</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPatients.map((patient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.lastVisit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Records Pending Review
            </h3>
            <Link
              href="/doctor/medical-records"
              className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 cursor-pointer">
              <Eye className="w-4 h-4" />
              <span className="text-sm">View All Records</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicalRecords.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.patient}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.recordType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        record.status
                      )}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        record.priority
                      )}`}>
                      {record.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer">
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
