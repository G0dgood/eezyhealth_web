"use client";

import { useState, use, useMemo } from "react";
import { ArrowLeft, User, X } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import Button from "@/components/Button";
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
    id: patientId || "P001",
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

  const allAppointments =
    activeTab === "incoming" ? incomingAppointments : pastAppointments;

  const appointments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allAppointments.slice(startIndex, startIndex + pageSize);
  }, [allAppointments, currentPage]);

  const handleVitalsClick = () => {
    setIsVitalsModalOpen(true);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Patients", href: "/admin/users/patients" },
          { label: patient.name },
        ]}
      />

      {/* Patient Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users/patients"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 break-words">{patient.name}</h1>
              <p className="text-gray-600">Patient ID: {patient.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DOCTOR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SPECIALTY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BOOKING ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-sm uppercase tracking-wider">
                  TIME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CHANNEL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appointment.doctor}
                  </td>
                  <td >
                    {appointment.specialty}
                  </td>
                  <td >
                    {appointment.bookingId}
                  </td>
                  <td >
                    {appointment.date}
                  </td>
                  <td >
                    {appointment.time}
                  </td>
                  <td >
                    {appointment.channel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost-primary"
                      size="sm"
                      onClick={handleVitalsClick}
                      className="px-2"
                    >
                      Vitals
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalCount={allAppointments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="appointments"
          />
        </div>
      </div>

      {/* Vitals Modal */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 bg-[#00000051] bg-opacity-50 z-40">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-50 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900">Vitals</h3>
                <Button
                  variant="ghost-neutral"
                  size="sm"
                  icon={<X className="w-5 h-5" />}
                  iconOnly
                  onClick={() => setIsVitalsModalOpen(false)}
                />
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Heart Rate:</span>
                    <span className="font-semibold text-gray-900">71 bpm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Blood Pressure:</span>
                    <span className="font-semibold text-gray-900">
                      120/90 mmHg
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-semibold text-gray-900">68 kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold text-gray-900">30 °C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
