"use client";

import { useState, useMemo } from "react";
import { Calendar, Plus, Search } from "lucide-react";
import DataTable from "@/components/DataTable";
import Input from "@/components/Input";
import { useGetBookingsQuery } from "@/store/bookingApi";
import { useGetFirebaseDoctorsQuery } from "@/store/doctorFirebaseApi";
import StatusBadge from "@/components/StatusBadge";

const getDoctorName = (doc: any) => {
  if (doc.displayName) return doc.displayName;
  if (doc.name) return doc.name;
  if (doc.first_name) {
    return `${doc.title || "Dr."} ${doc.first_name} ${doc.last_name || ""}`.trim();
  }
  return doc.email || "Unknown Doctor";
};

export default function NurseAppointmentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // RTK Query calls
  const { data: bookingsData, isLoading, error } = useGetBookingsQuery({});
  const { data: doctorsData } = useGetFirebaseDoctorsQuery({});

  const doctors = useMemo(() => {
    return (doctorsData || []) as any[];
  }, [doctorsData]);

  // Convert raw booking data to standard format
  const appointments = useMemo(() => {
    const raw = Array.isArray(bookingsData) ? bookingsData : (bookingsData as any)?.bookings || [];
    if (!raw || raw.length === 0) return [];

    return raw.map((booking: any) => {
      // Convert slot key (e.g. morning_6am -> 06:00 AM)
      const slotToTime = (slot: string): string => {
        const slotLower = (slot || "").toLowerCase();
        const hourMatch = slotLower.match(/(\d+)(am|pm)/);
        if (!hourMatch) return "06:00 AM";

        const hour = parseInt(hourMatch[1]);
        const period = hourMatch[2].toUpperCase();
        return `${hour.toString().padStart(2, "0")}:00 ${period}`;
      };

      // Convert timestamp to Date object
      let bookingDateObj: Date | null = null;
      if (booking.bookingDate?._seconds) {
        bookingDateObj = new Date(booking.bookingDate._seconds * 1000);
      } else if (booking.bookingDate?.seconds) {
        bookingDateObj = new Date(booking.bookingDate.seconds * 1000);
      } else if (booking.bookingDate) {
        bookingDateObj = new Date(booking.bookingDate);
      }

      let dateStr = "N/A";
      let dateKey = ""; // YYYY-MM-DD
      if (bookingDateObj && !isNaN(bookingDateObj.getTime())) {
        const d = String(bookingDateObj.getDate()).padStart(2, "0");
        const m = String(bookingDateObj.getMonth() + 1).padStart(2, "0");
        const y = bookingDateObj.getFullYear();
        dateStr = `${d}-${m}-${y}`;
        dateKey = `${y}-${m}-${d}`;
      }

      return {
        id: booking.bookingId || booking.id,
        patient: booking.patientName || "Unknown Patient",
        doctor: booking.doctorName || "Unknown Doctor",
        doctorId: booking.doctorId || "",
        date: dateStr,
        dateKey: dateKey,
        time: slotToTime(booking.slot),
        type: booking.bookingChannel === "physical" ? "Physical Consultation" : `${booking.bookingChannel || "Video"} Consultation`,
        status: ((s) => {
          const status = (s || "").toLowerCase();
          if (status === "accepted" || status === "confirmed") return "Confirmed";
          if (status === "cancelled" || status === "rejected") return "Cancelled";
          return "Pending";
        })(booking.bookingStatus),
      };
    });
  }, [bookingsData]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt: any) => {
      const matchSearch =
        appt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDate = selectedDate ? appt.dateKey === selectedDate : true;
      const matchDoctor = selectedDoctorId ? appt.doctorId === selectedDoctorId : true;

      return matchSearch && matchDate && matchDoctor;
    });
  }, [appointments, searchTerm, selectedDate, selectedDoctorId]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const todayObj = new Date();
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, "0");
    const d = String(todayObj.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const todayAppts = appointments.filter((a: any) => a.dateKey === todayStr).length;
    const pendingAppts = appointments.filter((a: any) => a.status === "Pending").length;
    const confirmedAppts = appointments.filter((a: any) => a.status === "Confirmed").length;

    return {
      today: todayAppts,
      pending: pendingAppts,
      confirmed: confirmedAppts,
    };
  }, [appointments]);

  const columns = [
    { key: "patient", label: "PATIENT" },
    { key: "doctor", label: "DOCTOR" },
    { key: "date", label: "DATE" },
    { key: "time", label: "TIME" },
    { key: "type", label: "TYPE" },
    {
      key: "status",
      label: "STATUS",
      render: (value: string | number) => (
        <StatusBadge status={String(value)} />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">
          Manage and schedule patient appointments
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            startIcon={<Search className="w-5 h-5 text-gray-400" />}
            fullWidth
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg shadow-sm">
            <span className="text-xs text-gray-500 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Doctor Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg shadow-sm">
            <span className="text-xs text-gray-500 font-medium">Doctor:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer"
            >
              <option value="">All Doctors</option>
              {doctors.map((doc: any) => (
                <option key={doc.uid || doc.doctorId || doc.id} value={doc.uid || doc.doctorId || doc.id}>
                  {getDoctorName(doc)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto text-center">Loading appointments...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAppointments}
          currentPage={currentPage}
          totalCount={filteredAppointments.length}
          pageSize={10}
          onPageChange={setCurrentPage}
          itemLabel="appointments"
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Today&apos;s Appointments</p>
              <p className="text-[18px] md:text-[20px] font-bold text-blue-600">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Pending Confirmations</p>
              <p className="text-[18px] md:text-[20px] font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className=" !text-[10px]  !md:text-[12px] text-gray-600">Completed/Confirmed</p>
              <p className="text-[18px] md:text-[20px] font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
