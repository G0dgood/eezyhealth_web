"use client";

import { useState } from "react";
import { UserCheck, Stethoscope, Calendar, AlertCircle } from "lucide-react";
import Pagination from "@/components/Pagination";

interface VerificationRequest {
  name: string;
  specialization: string;
  date: string;
  status: string;
}

interface DoctorVerificationWidgetProps {
  requests?: VerificationRequest[];
  className?: string;
  maxItems?: number;
}

export default function DoctorVerificationWidget({
  requests = [],
  className = "",
  maxItems = 4,
}: DoctorVerificationWidgetProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = maxItems;
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <UserCheck className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Doctor Verification Requests
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              Pending verification requests
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <UserCheck className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500 text-sm">No verification requests pending</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedRequests.map((request, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 border border-gray-100"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                      {request.name}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {request.specialization}
                    </p>
                  </div>
                </div>

                {/* Date and Status */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0 mt-1 sm:mt-0">
                  <div className="flex items-center text-gray-500 text-xs md:text-sm whitespace-nowrap">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                    {request.date}
                  </div>
                  <span
                    className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* Pagination */}
      {totalPages > 1 && ( 
          <Pagination
            currentPage={currentPage}
            totalCount={requests.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="requests"
            className="mt-4"
          /> 
      )}
      </div>


      {/* Footer with total count */}
      {requests.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 py-3 md:mx-[-1.5rem] md:mb-[-1.5rem] md:px-6 md:rounded-b-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {requests.length} request{requests.length !== 1 ? 's' : ''} pending
            </span>
            <button className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors">
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
