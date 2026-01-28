"use client";

import { useState } from "react";
import { Filter, Calendar, Clock, User, Video, Phone, MessageCircle, MapPin } from "lucide-react";
import { getTypeColor } from "@/components/Options";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useBookingsByDoctorId } from "@/hooks/useBookingsByDoctorId";
import FormattedSlot from "@/components/common/FormattedSlot";
import Link from "next/link";

interface TodaysAppointmentsWidgetProps {
  className?: string;
  showFilter?: boolean;
  maxItems?: number;
}

export default function TodaysAppointmentsWidget({
  className = "",
  showFilter = true,
  maxItems = 4,
}: TodaysAppointmentsWidgetProps) {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useBookingsByDoctorId(user?.uid || null);
  const [currentPage, setCurrentPage] = useState(1);

  // Parse and filter for today's appointments
  const todayAppointments = (bookingsData || []).filter((booking) => {
    if (!booking.bookingDate && !booking.date) return false;
    
    let date: Date | null = null;
    const dateVal = booking.bookingDate || booking.date;

    if (typeof dateVal === 'object' && dateVal && 'seconds' in dateVal) {
      date = new Date((dateVal as { seconds: number }).seconds * 1000);
    } else if (typeof dateVal === 'string') {
      let dateStr = dateVal;
      dateStr = dateStr.replace(/\s+at\s+/i, " ");
      dateStr = dateStr.replace(/[\u202F\u00A0]/g, " ");
      date = new Date(dateStr);
      if (isNaN(date.getTime()) && dateStr.includes("UTC")) {
        const cleaned = dateStr.replace(/\s*UTC[+\-]?\d*$/, "");
        date = new Date(cleaned);
      }
    } else if (typeof dateVal === 'number') {
      date = new Date(dateVal);
    }

    if (!date || isNaN(date.getTime())) return false;

    const today = new Date();
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  }).map((booking): {
    id: string;
    patient: string;
    time: string;
    type: string;
    status: string;
    specialization: string;
  } => ({
    id: String(booking.id),
    patient: String(booking.patientName || booking.first_name || "Unknown Patient"),
    time: String(booking.slot || booking.bookingTime || "N/A"),
    type: String(booking.bookingChannel || booking.channel || "Video Call"),
    status: String(booking.bookingStatus || "Pending"),
    specialization: String(booking.consultationReason || "General Checkup")
  }));

  const itemsPerPage = maxItems;
  const totalPages = Math.ceil(todayAppointments.length / itemsPerPage);

  const paginatedAppointments = todayAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getChannelIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('video')) return <Video className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />;
    if (lowerType.includes('voice') || lowerType.includes('audio')) return <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />;
    if (lowerType.includes('chat')) return <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />;
    return <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 md:px-6 md:py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Today&apos;s Schedule
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {formatDate()}
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
        {todayAppointments.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <Calendar className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500 text-xs md:text-sm">No appointments scheduled for today</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-3 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-3 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="text-xs md:text-sm text-gray-500">
                          {appointment.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                      ${appointment.status.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        appointment.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                      <div className="text-xs md:text-sm text-gray-900">
                        <FormattedSlot slot={appointment.time} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      {getChannelIcon(appointment.type)}
                      <span className="text-xs md:text-sm text-gray-700 capitalize">
                        {appointment.type}
                      </span>
                    </div>
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
            totalCount={todayAppointments.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="appointments"
            className="mt-4"
          />
        )}
      </div>


      {/* Footer with total count */}
      {todayAppointments.length > 0 && (
        <div className="px-4 py-3 md:px-6 md:py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <span className="text-xs md:text-sm text-gray-600">
              {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} today
            </span>
            <Link href="/doctor/bookings" className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
