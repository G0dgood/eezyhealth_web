"use client";

import { useState } from "react";
import { Filter, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { getTypeColor } from "@/components/Options";

interface Appointment {
  patient: string;
  doctor: string;
  specialization: string;
  time: string;
  type: string;
}

interface TodaysAppointmentsWidgetProps {
  appointments?: Appointment[];
  date?: string;
  className?: string;
  showFilter?: boolean;
  maxItems?: number;
}

export default function TodaysAppointmentsWidget({
  appointments = [],
  date,
  className = "",
  showFilter = true,
  maxItems = 4,
}: TodaysAppointmentsWidgetProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = maxItems;
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    return dateString;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Today&apos;s Appointments
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(date)}
              </p>
            </div>
          </div>
          {showFilter && (
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {appointments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <Calendar className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500 text-sm">No appointments scheduled for today</p>
            </div>
          </div>
        ) : (
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
              {paginatedAppointments.map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {appointment.doctor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {appointment.time}
                      </span>
                    </div>
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer hover:text-gray-700 transition-colors">
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with total count */}
      {appointments.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today
            </span>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
