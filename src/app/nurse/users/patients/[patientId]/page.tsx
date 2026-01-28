"use client";

import { useState, use, useMemo } from "react";
import { ArrowLeft, User, X } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import VitalsModal from "@/components/modals/VitalsModal";
import PillTabs from "@/components/Tabs/PillTabs";

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const [activeTab, setActiveTab] = useState<"incoming" | "past">("incoming");
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sample patient data
  const patient = {
    name: "Seun Simeon",
    id: "P001",
  };

  // Sample appointment data
  const incomingAppointments = [
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "24-05-2024",
      time: "08:30 AM",
      channel: "Chat",
    },
    {
      doctor: "Dr. Mary Paul",
      specialty: "Cardiologist",
      bookingId: "92KmLpVQRE45",
      date: "26-05-2024",
      time: "10:00 AM",
      channel: "Video call",
    },
  ];

  const pastAppointments = [
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "14-04-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
    {
      doctor: "Dr. Tunde Paul",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "24-03-2024",
      time: "08:30 AM",
      channel: "Voice Call",
    },
    {
      doctor: "Dr. Mary Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "21-03-2024",
      time: "08:30 AM",
      channel: "Voice Call",
    },
    {
      doctor: "Dr. Tunde Sanni",
      specialty: "Dentist",
      bookingId: "86FnyUQIRE23",
      date: "04-02-2024",
      time: "08:30 AM",
      channel: "Video call",
    },
  ];

  const appointments =
    activeTab === "incoming" ? incomingAppointments : pastAppointments;

  const totalAppointments = appointments.length;

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return appointments.slice(startIndex, startIndex + pageSize);
  }, [appointments, currentPage]);

  const handleVitalsClick = () => {
    setIsVitalsModalOpen(true);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Nurse", href: "/nurse" },
          { label: "Users", href: "/nurse/users" },
          { label: "Patients", href: "/nurse/users/patients" },
          { label: patient.name },
        ]}
      />

      {/* Patient Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/nurse/users/patients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600">Patient ID: {patient.id}</p>
          </div>
        </div>
      </div>

      {/* Appointment Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <PillTabs
            tabs={[
              { id: "incoming", label: "Incoming Appointment" },
              { id: "past", label: "Past Appointment" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th >
                  DOCTOR
                </th>
                <th >
                  SPECIALTY
                </th>
                <th >
                  BOOKING ID
                </th>
                <th >
                  DATE
                </th>
                <th >
                  TIME
                </th>
                <th >
                  CHANNEL
                </th>
                <th >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAppointments.map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] font-medium text-gray-900">
                    {appointment.doctor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-900">
                    {appointment.specialty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-900">
                    {appointment.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-900">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-900">
                    {appointment.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] text-gray-900">
                    {appointment.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap  !text-[10px]  !md:text-[12px] font-medium">
                    <button
                      onClick={handleVitalsClick}
                      className="text-green-600 hover:text-green-700 font-medium  !text-[10px]  !md:text-[12px] cursor-pointer">
                      Vitals
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalCount={totalAppointments}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="appointments"
          />
        </div>
      </div>

      {/* Vitals Modal */}
      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        patientId={patientId}
      />
    </div>
  );
}
