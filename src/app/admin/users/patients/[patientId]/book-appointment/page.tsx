"use client";

import { useState } from "react";
import { ArrowLeft, Star, Calendar, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";

export default function BookAppointmentPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  // Sample available doctors data
  const availableDoctors = [
    {
      id: "D001",
      name: "Dr. Tunde Sanni",
      specialty: "Dentist",
      experience: "8 years",
      rating: 4.8,
      totalReviews: 127,
      consultationFee: "₦5,000",
      availableSlots: "12 slots today",
      location: "Lagos, Nigeria",
      phone: "+234 801 234 5678",
      image: "/api/placeholder/120/120",
      availableTimes: [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "02:00 PM",
        "03:00 PM",
      ],
    },
    {
      id: "D002",
      name: "Dr. Mary Paul",
      specialty: "Cardiologist",
      experience: "12 years",
      rating: 4.9,
      totalReviews: 89,
      consultationFee: "₦8,000",
      availableSlots: "8 slots today",
      location: "Abuja, Nigeria",
      phone: "+234 802 345 6789",
      image: "/api/placeholder/120/120",
      availableTimes: ["10:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"],
    },
    {
      id: "D003",
      name: "Dr. Paul Moses",
      specialty: "Dermatologist",
      experience: "6 years",
      rating: 4.7,
      totalReviews: 156,
      consultationFee: "₦6,000",
      availableSlots: "15 slots today",
      location: "Port Harcourt, Nigeria",
      phone: "+234 803 456 7890",
      image: "/api/placeholder/120/120",
      availableTimes: [
        "08:00 AM",
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "02:00 PM",
        "03:00 PM",
      ],
    },
    {
      id: "D004",
      name: "Dr. Sarah James",
      specialty: "Pediatrician",
      experience: "10 years",
      rating: 4.9,
      totalReviews: 203,
      consultationFee: "₦7,000",
      availableSlots: "10 slots today",
      location: "Kano, Nigeria",
      phone: "+234 804 567 8901",
      image: "/api/placeholder/120/120",
      availableTimes: [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "01:00 PM",
        "02:00 PM",
      ],
    },
    {
      id: "D005",
      name: "Dr. Zainab Ali",
      specialty: "Gynecologist",
      experience: "15 years",
      rating: 4.8,
      totalReviews: 178,
      consultationFee: "₦9,000",
      availableSlots: "6 slots today",
      location: "Ibadan, Nigeria",
      phone: "+234 805 678 9012",
      image: "/api/placeholder/120/120",
      availableTimes: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    },
    {
      id: "D006",
      name: "Dr. Ahmed Hassan",
      specialty: "Neurologist",
      experience: "18 years",
      rating: 4.9,
      totalReviews: 95,
      consultationFee: "₦12,000",
      availableSlots: "4 slots today",
      location: "Kaduna, Nigeria",
      phone: "+234 806 789 0123",
      image: "/api/placeholder/120/120",
      availableTimes: ["09:00 AM", "11:00 AM", "02:00 PM"],
    },
  ];

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    // Here you can navigate to the actual booking page or open a booking modal

  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: "Patients", href: "/admin/users/patients" },
          { label: "Book Appointment" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
        <Link
          href="/admin/users/patients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-[16px] md:text-[18px] sm:text-2xl font-bold text-gray-900">
            Book Appointment
          </h1>
          <p className=" text-[10px]  md:text-[12px] sm:text-base text-gray-600">
            Select a doctor to book your appointment
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {availableDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${selectedDoctor === doctor.id
              ? "border-green-500 ring-2 ring-green-200"
              : "border-gray-200 hover:border-green-300"
              }`}
            onClick={() => handleDoctorSelect(doctor.id)}>
            {/* Doctor Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-[14px] md:text-[16px] font-semibold text-gray-900 mb-1 truncate">
                    {doctor.name}
                  </h3>
                  <p className="text-green-600 font-medium mb-2  text-[10px]  md:text-[12px] sm:text-base">
                    {doctor.specialty}
                  </p>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(doctor.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                      {doctor.rating} ({doctor.totalReviews})
                    </span>
                  </div>
                  <p className="text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                    {doctor.experience} experience
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Details */}
            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{doctor.availableSlots}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  Available: {doctor.availableTimes.slice(0, 2).join(", ")}
                  {doctor.availableTimes.length > 2 && "..."}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm: text-[10px]  md:text-[12px] text-gray-600">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{doctor.phone}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <span className="text-base sm:text-[14px] md:text-[16px] font-bold text-green-600">
                  {doctor.consultationFee}
                </span>
                <Link
                  href={`/admin/users/patients/book-appointment/${doctor.id}`}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer  text-[10px]  md:text-[12px] sm:text-base text-center">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
