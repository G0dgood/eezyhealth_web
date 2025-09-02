"use client";

import { useState } from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  Camera, 
  Filter
} from "lucide-react";
import { getTypeColor } from "@/components/Options";

export default function AdminDashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Sample data for today's appointments
  const todaysAppointments = [
    {
      patient: "Tina Simeon",
      doctor: "Dr Mary Paul",
      specialization: "ENT",
      time: "09:00 AM",
      type: "Video",
    },
    {
      patient: "Tina Simeon",
      doctor: "Dr Paul moses",
      specialization: "Dermatologist",
      time: "10:30 AM",
      type: "Chat",
    },
    {
      patient: "Tina Simeon",
      doctor: "Dr Mary Paul",
      specialization: "Cardiologist",
      time: "02:00 PM",
      type: "Call",
    },
    {
      patient: "Tina Simeon",
      doctor: "Dr Paul moses",
      specialization: "ENT",
      time: "03:30 PM",
      type: "Video",
    },
  ];

  // Sample data for doctor verification requests
  const doctorVerificationRequests = [
    {
      name: "Dr Mary Paul",
      specialization: "ENT",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      name: "Dr Paul moses",
      specialization: "Dermatologist",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      name: "Dr Mary Paul",
      specialization: "Cardiologist",
      date: "24-05-2024",
      status: "Pending",
    },
    {
      name: "Dr Paul moses",
      specialization: "ENT",
      date: "24-05-2024",
      status: "Pending",
    },
  ];

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
              <p className="text-3xl font-bold">232</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Doctors
              </p>
              <p className="text-3xl font-bold">56</p>
            </div>
            <Stethoscope className="w-12 h-12 text-green-200" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">
                Total Bookings
              </p>
              <p className="text-3xl font-bold">453</p>
            </div>
            <Calendar className="w-12 h-12 text-pink-200" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold">N230,000</p>
            </div>
            <Camera className="w-12 h-12 text-green-200" />
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
                Today&apos;s Appointment (01-08-2025)
              </h3>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
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

        {/* Doctor Verification Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Doctor Verification Requests
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctorVerificationRequests.map((request, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 cursor-pointer">
                        Pending
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
    </div>
  );
}
