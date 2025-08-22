"use client";

import Breadcrumb from "@/components/Breadcrumb";

export default function NurseBookingsPage() {
  // Sample booking data
  const bookingsData = [
    {
      patient: "Seun Simeon",
      doctor: "Dr. Tunde Sanni",
      date: "25-05-2024",
      time: "09:00 AM",
      type: "Video Consultation",
      status: "Confirmed",
      amount: "₦5,000",
    },
    {
      patient: "Felix Simeon",
      doctor: "Dr. Mary Paul",
      date: "25-05-2024",
      time: "10:30 AM",
      type: "Chat Consultation",
      status: "Pending",
      amount: "₦3,000",
    },
    {
      patient: "Kofi Simeon",
      doctor: "Dr. Paul Moses",
      date: "25-05-2024",
      time: "02:00 PM",
      type: "Voice Call",
      status: "Confirmed",
      amount: "₦4,000",
    },
    {
      patient: "Fatima Simeon",
      doctor: "Dr. Sarah James",
      date: "26-05-2024",
      time: "09:00 AM",
      type: "Video Consultation",
      status: "Confirmed",
      amount: "₦5,000",
    },
    {
      patient: "Joy Simeon",
      doctor: "Dr. Zainab Ali",
      date: "26-05-2024",
      time: "11:30 AM",
      type: "Chat Consultation",
      status: "Pending",
      amount: "₦3,000",
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Nurse", href: "/nurse" }, { label: "Bookings" }]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-gray-600">
          Manage and schedule patient appointments
        </p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Bookings
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingsData.map((booking, index) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer">
                        View Details
                      </button>
                      <button className="text-green-600 hover:text-green-700 font-medium text-sm cursor-pointer">
                        Confirm
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
