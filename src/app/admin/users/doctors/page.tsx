"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Mail,
  Phone,
  HelpCircle,
  Bell,
  User,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import Image from "next/image";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  email: string;
  phone: string;
  isTopDoctor: boolean;
  image: string;
}

export default function AdminDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample doctor data
  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr Prosper Matt",
      specialization: "Psychologist Specialist",
      experience: "10 years experience",
      rating: 4.0,
      email: "prospermatt@gmail.com",
      phone: "+234144236775",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "2",
      name: "Dr Sarah Johnson",
      specialization: "Cardiologist",
      experience: "8 years experience",
      rating: 4.5,
      email: "sarah.johnson@email.com",
      phone: "+234144236776",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "3",
      name: "Dr Michael Chen",
      specialization: "Neurologist",
      experience: "12 years experience",
      rating: 4.8,
      email: "michael.chen@email.com",
      phone: "+234144236777",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "4",
      name: "Dr Emily Davis",
      specialization: "Pediatrician",
      experience: "6 years experience",
      rating: 4.2,
      email: "emily.davis@email.com",
      phone: "+234144236778",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "5",
      name: "Dr Robert Wilson",
      specialization: "Orthopedic Surgeon",
      experience: "15 years experience",
      rating: 4.7,
      email: "robert.wilson@email.com",
      phone: "+234144236779",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "6",
      name: "Dr Lisa Brown",
      specialization: "Dermatologist",
      experience: "9 years experience",
      rating: 4.3,
      email: "lisa.brown@email.com",
      phone: "+234144236780",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "7",
      name: "Dr James Miller",
      specialization: "Oncologist",
      experience: "11 years experience",
      rating: 4.6,
      email: "james.miller@email.com",
      phone: "+234144236781",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
    {
      id: "8",
      name: "Dr Maria Garcia",
      specialization: "Endocrinologist",
      experience: "7 years experience",
      rating: 4.1,
      email: "maria.garcia@email.com",
      phone: "+234144236782",
      isTopDoctor: true,
      image: "/api/placeholder/120/120",
    },
  ];

  const topDoctors = doctors.filter((d) => d.isTopDoctor);
  const regularDoctors = doctors.slice(0, 4); // Show first 4 as regular doctors

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const topDoctorColors = [
    "bg-yellow-400",
    "bg-green-400",
    "bg-pink-500",
    "bg-green-600",
    "bg-blue-500",
    "bg-pink-400",
    "bg-green-300",
    "bg-green-700",
  ];

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/admin"
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Doctors", href: "/admin/users/doctors" },
          ]}
        />
      </div>

      <Title title="Doctor Management" />

      {/* Top Doctors Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Top Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`${topDoctorColors[index]} rounded-lg p-6 relative overflow-hidden shadow-lg`}>
              {/* Top Doctor Banner */}
              <div className="absolute top-0 left-0 bg-yellow-500 text-red-600 px-3 py-1 text-xs font-bold transform -rotate-45 origin-top-left">
                Top Doctor
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-sm text-gray-800 mb-2">
                  {doctor.specialization}
                </p>
                <p className="text-xs text-gray-700 mb-3">
                  {doctor.experience}
                </p>

                <div className="flex items-center justify-center mb-3">
                  {renderStars(doctor.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {doctor.rating}
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regular Doctors Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">All Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {doctor.specialization}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {doctor.experience}
                </p>

                <div className="flex items-center justify-center mb-3">
                  {renderStars(doctor.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {doctor.rating}
                  </span>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
