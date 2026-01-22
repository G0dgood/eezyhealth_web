"use client";

import { useState } from "react";
import { Filter, Calendar, Clock, User, Stethoscope } from "lucide-react";
import { getTypeColor } from "@/components/Options";
import Pagination from "@/components/Pagination";

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
    <div className={`bg-white rounded-lg  border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Today&apos;s Appointments
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {formatDate(date)}
              </p>
            </div>
          </div>
          {showFilter && (
            <button className="flex items-center space-x-2 px-2 py-1.5 md:px-3 md:py-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
              <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Filter</span>
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
                <th >
                  Patient
                </th>
                <th >
                  Doctor
                </th>
                <th >
                  Time
                </th>
                <th >
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-medium text-gray-900">
                          {appointment.patient}
                        </div>
                        <div className="text-[10px] md:text-sm text-gray-500">
                          {appointment.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <Stethoscope className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-xs md:text-sm text-gray-900">
                        {appointment.doctor}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <span className="text-xs md:text-sm text-gray-900">
                        {appointment.time}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${getTypeColor(
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
      {/* Pagination */}
      {totalPages > 1 && ( 
          <Pagination
            currentPage={currentPage}
            totalCount={appointments.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="appointments"
            className="mt-4"
          />  
      )}
      </div>


      {/* Footer with total count */}
      {appointments.length > 0 && (
        <div className="px-4 py-3 md:px-6 md:py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <span className="text-xs md:text-sm text-gray-600">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} today
            </span>
            <button className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
