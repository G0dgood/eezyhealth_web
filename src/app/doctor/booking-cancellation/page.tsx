"use client";
import { useState } from "react";

import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";

interface CancelledAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Cancelled";
}

export default function DoctorBookingCancellationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cancelledAppointments: CancelledAppointment[] = [
    {
      id: "1",
      patientName: "Godwin Paul",
      date: "2 December 2024",
      time: "8:30 AM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "2",
      patientName: "Daniel Sean",
      date: "1 December 2024",
      time: "9:30 AM",
      reason: "Schedule Conflict",
      status: "Cancelled",
    },
    {
      id: "3",
      patientName: "Tolu Ali",
      date: "27 November 2024",
      time: "10:00 AM",
      reason: "Doctor Illness",
      status: "Cancelled",
    },
    {
      id: "4",
      patientName: "Fatima Tope",
      date: "23 November 2024",
      time: "8:00 AM",
      reason: "Patient Request",
      status: "Cancelled",
    },
    {
      id: "5",
      patientName: "Seun Okoro",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "6",
      patientName: "Aisha Taiwo",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "7",
      patientName: "Joy Pascal",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "8",
      patientName: "Hadiza Sanni",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "9",
      patientName: "Kofi Ben",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
    {
      id: "10",
      patientName: "Efe Felix",
      date: "23 November 2024",
      time: "2:00 PM",
      reason: "Doctor Emergency",
      status: "Cancelled",
    },
  ];

  // Filter appointments based on search term
  const filteredAppointments = cancelledAppointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            {
              label: "Booking Cancellation",
              href: "/doctor/booking-cancellation",
            },
          ]}
        />
      </div>

      <Title title="Cancelled Appointments" />

      <div className="relative max-w-md mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search patient..."
        />
      </div>

      {/* Appointments Table */}
      <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PATIENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  TIME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  REASON
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {currentAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-[var(--muted)]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {appointment.patientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--foreground)]">
                      {appointment.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--foreground)]">
                      {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--foreground)]">
                      {appointment.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-[var(--muted-foreground)]">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-md hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-md hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
