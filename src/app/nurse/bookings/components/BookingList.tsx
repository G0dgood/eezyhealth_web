import React from "react";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { NoRecordFound } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useGetBookingsQuery } from "@/store/api";

interface Booking {
  bookingId?: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  bookingChannel?: string;
  specialization?: string;
  bookingStatus?: string;
  status?: string;
}

const BookingList = () => {
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({});

  console.log("bookings---", bookings?.bookings);

  const [searchTerm, setSearchTerm] = useState("");
  const [bookingsData, setBookingsData] = useState<Booking[] | undefined>(bookings?.bookings);

  // Update bookingsData when bookings change
  useEffect(() => {
    setBookingsData(bookings?.bookings);
  }, [bookings?.bookings]);

  console.log("bookingsData---", bookingsData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setBookingsData(bookings?.bookings);
      return;
    }

    const filteredBookings = bookings?.bookings?.filter((booking: Booking) => {
      return booking.bookingStatus?.toLowerCase().includes(term) || false;
      // booking.doctorName?.toLowerCase().includes(term) ||
      // booking.specialization?.toLowerCase().includes(term) ||
      // booking.bookingChannel?.toLowerCase().includes(term)
    });

    setBookingsData(filteredBookings);
  };

  return (
    <div>
      <div className="relative flex-1 max-w-md mb-6">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patient, doctor, specialty or type"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      {/* Bookings Table */}
      {isLoading ? (
        <TableSkeleton
          columns={7}
          rows={5}
          headerLabels={[
            "Patient Name",
            "Doctor",
            "Date",
            "Time",
            "Channel",
            "Specialty",
            "Status",
          ]}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Channel</th>
                  <th>Specialty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookingsData?.length === 0 ||
                bookingsData?.length === undefined ? (
                  <NoRecordFound colSpan={7} />
                ) : (
                  bookingsData.map((booking: Booking, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-medium">
                          {booking?.patientName}
                        </span>
                      </td>
                      <td> {booking?.doctorName}</td>
                      <td>{booking?.date}</td>
                      <td>{booking?.time}</td>
                      <td>{booking?.bookingChannel}</td>
                      <td> {booking?.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            booking.bookingStatus === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {booking.bookingStatus || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
