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
} from "lucide-react";
import Link from "next/link";

export default function NurseDashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // Sample data for today's appointments
  const todaysAppointments = [
    {
      patient: "Sarah Johnson",
      doctor: "Dr Mary Paul",
      specialization: "ENT",
      time: "09:00 AM",
      status: "Confirmed",
      type: "Video",
    },
    {
      patient: "Michael Chen",
      doctor: "Dr Paul Moses",
      specialization: "Dermatology",
      time: "10:30 AM",
      status: "Pending",
      type: "In-Person",
    },
    {
      patient: "Emma Wilson",
      doctor: "Dr Mary Paul",
      specialization: "Cardiology",
      time: "02:00 PM",
      status: "Confirmed",
      type: "Call",
    },
    {
      patient: "David Brown",
      doctor: "Dr Paul Moses",
      specialization: "ENT",
      time: "03:30 PM",
      status: "Pending",
      type: "Video",
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
    },
    {
      name: "Michael Chen",
      age: 35,
      lastVisit: "1 week ago",
      nextAppointment: "Today, 10:30 AM",
      status: "Active",
    },
    {
      name: "Emma Wilson",
      age: 42,
      lastVisit: "3 days ago",
      nextAppointment: "Today, 02:00 PM",
      status: "Active",
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

  return (
    <div>
      {/* Main Content */}
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
                <p className="text-3xl font-bold">156</p>
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
                <p className="text-3xl font-bold">12</p>
              </div>
              <Calendar className="w-12 h-12 text-green-200" />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-orange-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Pending Tasks
                </p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <Clock className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-red-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">
                  Critical Alerts
                </p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    href="/nurse/bookings"
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
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
                      Doctor
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaysAppointments.map((appointment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.doctor}
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
                  href="/nurse/users/patients"
                  className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:text-green-700 cursor-pointer">
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
                      Next Appointment
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
                        {patient.nextAppointment}
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
      </div>
    </div>
  );
}