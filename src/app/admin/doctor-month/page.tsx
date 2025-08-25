"use client";

import { useState } from "react";
import { Trophy, User, Search, Bell } from "lucide-react";
import Title from "@/components/Title";

const AdminDoctorOfMonthPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // Sample data for past doctors of the month
  const pastDoctors = [
    {
      name: "Dr. Tunde Simeon",
      specialty: "Pediatrician",
      month: "December 2024",
      rating: "94%",
      cancellationRate: "2%",
      completedAppointments: "99%",
    },
    {
      name: "Dr. Ernest Simeon",
      specialty: "Neurologist",
      month: "November 2024",
      rating: "97%",
      cancellationRate: "3%",
      completedAppointments: "96%",
    },
    {
      name: "Dr. Godwin Simeon",
      specialty: "Dermatologist",
      month: "October 2024",
      rating: "97%",
      cancellationRate: "2%",
      completedAppointments: "97%",
    },
    {
      name: "Dr. Daniel Simeon",
      specialty: "Pediatrician",
      month: "September 2024",
      rating: "98%",
      cancellationRate: "3%",
      completedAppointments: "97%",
    },
    {
      name: "Dr. Seun Simeon",
      specialty: "Cardiologist",
      month: "August 2024",
      rating: "95%",
      cancellationRate: "2%",
      completedAppointments: "98%",
    },
    {
      name: "Dr. John Simeon",
      specialty: "Cardiologist",
      month: "August 2024",
      rating: "95%",
      cancellationRate: "2%",
      completedAppointments: "98%",
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <Title title="Doctor of The Month" />
      </div>

      {/* Current Leader Card */}
      <div className="flex justify-between items-center p-4 w-full md:w-[521px] h-[104px] bg-[#44CE2D] rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Current Leader</p>
            <p className="text-xl text-white font-bold">Dr. John Doe</p>
            <p className="text-white/80 text-sm">Cardiologist</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl text-white font-bold">98.3</p>
        </div>
      </div>

      {/* Top Performers and Past Winners Grid */}
      <div className="flex flex-col gap-6">
        {/* Top Performers This Month */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers This Month
          </h3>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm  w-full md:w-[521px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dr. John Doe</p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#44CE2D]">98.3</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full md:w-[521px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr. Daniel Simeon
                    </p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#44CE2D]">98.0</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full md:w-[521px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr. Godwin Simeon
                    </p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#44CE2D]">97.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Past Doctors of The Month Table */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Past Doctors of The Month
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOCTOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SPECIALTY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MONTH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RATING
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CANCELLATION RATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPLETED APPOINTMENT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pastDoctors.map((doctor, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.specialty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.rating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.cancellationRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doctor.completedAppointments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Page 1 of 5</span>
                <div className="flex space-x-2">
                  <button
                    disabled
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-[#44CE2D] text-white rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer">
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
};

export default AdminDoctorOfMonthPage;
