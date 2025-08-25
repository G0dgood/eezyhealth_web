"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { Search } from "lucide-react";

export default function NurseBookingsPage() {
  // Sample booking data
  const initialBookingsData = [
    {
      patient: "Seun Simeon",
      doctor: "Dr. Tunde Sanni",
      date: "25-05-2024",
      time: "09:00 AM",
      type: "Video Consultation",
      status: "Confirmed",
      amount: "₦5,000",
      Specialty: "Dentist",
    },
    {
      patient: "Felix Simeon",
      doctor: "Dr. Mary Paul",
      date: "25-05-2024",
      time: "10:30 AM",
      type: "Chat Consultation",
      status: "Pending",
      amount: "₦3,000",
      Specialty: "Cardiologist",
    },
    {
      patient: "Kofi Simeon",
      doctor: "Dr. Paul Moses",
      date: "25-05-2024",
      time: "02:00 PM",
      type: "Voice Call",
      status: "Confirmed",
      amount: "₦4,000",
      Specialty: "Neurologist",
    },
    {
      patient: "Fatima Simeon",
      doctor: "Dr. Sarah James",
      date: "26-05-2024",
      time: "09:00 AM",
      type: "Video Consultation",
      status: "Confirmed",
      amount: "₦5,000",
      Specialty: "Pediatrician",
    },
    {
      patient: "Joy Simeon",
      doctor: "Dr. Zainab Ali",
      date: "26-05-2024",
      time: "11:30 AM",
      type: "Chat Consultation",
      status: "Pending",
      amount: "₦3,000",
      Specialty: "Dentist",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [bookingsData, setBookingsData] = useState(initialBookingsData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setBookingsData(initialBookingsData);
      return;
    }

    const filteredBookings = initialBookingsData.filter((booking) => {
      return (
        booking.patient.toLowerCase().includes(term) ||
        booking.doctor.toLowerCase().includes(term) ||
        booking.Specialty.toLowerCase().includes(term) ||
        booking.type.toLowerCase().includes(term)
      );
    });

    setBookingsData(filteredBookings);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Nurse", href: "/nurse" }, { label: "Booking List" }]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking List</h1>
        <p className="text-gray-600 mb-4">
          Manage and schedule patient appointments
        </p>
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, doctor, specialty or type"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingsData.length > 0 ? (
                bookingsData.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-600 font-medium">
                        {booking.patient}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.Specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No bookings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
