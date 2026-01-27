"use client";

import { useState } from "react";
import {
  Star,
  Mail,
  Phone,
  MapPin,
  User,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Image from "next/image";
import Button from "@/components/Button";
import { useGetFirebaseDoctorProfilesQuery } from "@/store/doctorFirebaseApi";
import { NoRecordFound } from "@/components/Options";
import { topDoctorColors, topDoctorMainColors } from "@/components/Options";

interface Doctor {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  specialization?: string;
  experience_yrs?: string;
  rating?: number;
  email: string;
  phone_number?: string;
  isTop?: boolean;
  isActive?: boolean;
  isVerify?: boolean;
  address?: string;
  hospital?: string;
  about?: string;
  availability?: {
    [day: string]: {
      [time: string]: string;
    };
  };
  createdTime?: Date | string;
  date_of_birth?: Date | string;
  doctorId?: string;
  photo_url?: string;
  image?: string;
}

export default function AdminDoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch doctors using RTK Query (same as nurse page)
  const {
    data: doctorsData = [],
    isLoading,
    error,
    isError,
  } = useGetFirebaseDoctorProfilesQuery({});

  // Transform the data to match our Doctor interface (same as nurse page)
  const transformedDoctors: Doctor[] = doctorsData.map(
    (doc: Record<string, unknown>, index: number) => ({
      id: (doc.doctorId as string) || (doc.id as string) || `doc-${index}`,
      display_name: doc.display_name as string,
      first_name: doc.first_name as string,
      last_name: doc.last_name as string,
      title: doc.title as string,
      specialization: doc.specialization as string,
      experience_yrs: doc.experience_yrs as string,
      rating: typeof doc.rating === "number" ? doc.rating : 0,
      email: doc.email as string,
      phone_number: doc.phone_number as string,
      isTop: typeof doc.isTop === "boolean" ? doc.isTop : false,
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      isVerify: typeof doc.isVerify === "boolean" ? doc.isVerify : false,
      address: doc.address as string,
      hospital: doc.hospital as string,
      about: doc.about as string,
      availability: doc.availability as {
        [day: string]: {
          [time: string]: string;
        };
      },
      createdTime: doc.createdTime as Date | string,
      date_of_birth: doc.date_of_birth as Date | string,
      doctorId: doc.doctorId as string,
      photo_url: doc.photo_url as string,
      image: doc.image as string,
    })
  );

  // Use transformed doctors data
  const doctors = transformedDoctors;

  // Debug logging

  // Filter doctors based on search (same as nurse page)
  const filteredDoctors = doctors.filter((doctor) => {
    const name =
      doctor.display_name ||
      `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() ||
      "";
    const specialization = doctor.specialization || doctor.title || "";

    return (
      (typeof name === "string" &&
        name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof specialization === "string" &&
        specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Determine top doctors (same as nurse page)
  const topDoctors = doctors.filter(
    (d) => d.isTop || (typeof d.rating === "number" && d.rating >= 4.5)
  );
  const regularDoctors = doctors
    .filter((d) => !d.isTop && (typeof d.rating !== "number" || d.rating < 4.5))
    .slice(0, 8); // Show first 8 as regular doctors

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
        />
      );
    }
    return stars;
  };

  // Loading state (same as nurse page)
  if (isLoading) {
    return (
      <div>
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        {/* Header and Search Skeleton */}
        <div className="flex flex-row justify-between items-center mb-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>

        {/* Top Doctors Section Skeleton */}
        <div className="mb-12">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                {/* Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>

                {/* Button */}
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* All Doctors Section Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                {/* Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>

                {/* Button */}
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state (same as nurse page)
  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Failed to load doctors
        </h2>
        <p className="text-gray-600 mb-6">
          Please try again or contact support if the problem persists.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="primary"
          className="px-6 py-3"
        >
          Retry
        </Button>
      </div>
    );
  }

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

      <div className="flex flex-row justify-between items-center mb-4">
        <Title title="Doctor Management" />

        {/* Search Bar */}
        <div >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search doctors by name, specialization, or email..."
            className="max-w-none"
          />
        </div>
      </div>


      {/* Top Doctors Section */}
      <div className="mb-12 cursor-pointer">
        <h2 className="text-2xl font-semibold mb-6">Top Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`${topDoctorColors[index]} rounded-lg p-6 relative overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200`}>
              {/* Top Doctor Banner */}
              <div
                className={`${topDoctorMainColors[index]} absolute top-[110px] left-[-30px] text-[#fff] px-3 py-1 w-[200px] text-xs font-bold transform -rotate-45 origin-top-left text-center font-inter text-[12px] leading-[15px]  
         tracking-[0.5px]`}>
                Top Doctor
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white">
                  <img
                    src={
                      doctor.photo_url ||
                      doctor.image ||
                      ""
                    }
                    alt={doctor.display_name || "Doctor"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {doctor.title || `${doctor.title}`.trim() || "N/A"}
                </h3>
                <p className="text-[10px] md:text-[12px] text-gray-600 mb-2">
                  {doctor.display_name?.trim() || ""}
                </p>
                <p className="text-[10px] md:text-[12px] text-gray-600 mb-2">
                  {`${doctor.first_name || ""}  ${doctor.last_name || ""
                    }`.trim() || ""}
                </p>

                <div className="flex items-center justify-center mb-3">
                  {renderStars(doctor.rating || 0)}
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor.phone_number || "Phone not available"}</span>
                  </div>

                  {doctor.hospital && (
                    <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                      <User className="w-4 h-4 mr-2" />
                      <span className="truncate">{doctor.hospital}</span>
                    </div>
                  )}

                  {doctor.address && (
                    <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{doctor.address}</span>
                    </div>
                  )}
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
          {regularDoctors?.map((doctor: Doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={
                      doctor.photo_url ||
                      doctor.image ||
                      "/api/placeholder/120/120"
                    }
                    alt={doctor.display_name || "Doctor"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {doctor.display_name || `${doctor.title}`.trim() || "N/A"}
                </h3>
                <p className="text-[10px] md:text-[12px] text-gray-600 mb-2">
                  {doctor.display_name?.trim() || "N/A"}
                </p>
                <p className="text-[10px] md:text-[12px] text-gray-600 mb-2">
                  {`${doctor.first_name || ""} ${doctor.last_name || ""
                    }`.trim() || "N/A"}
                </p>
                <p className="text-[10px] md:text-[12px] text-gray-600 mb-2">
                  {doctor.specialization || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {doctor.experience_yrs
                    ? `${doctor.experience_yrs} years experience`
                    : "N/A"}
                </p>

                <div className="flex items-center justify-center mb-3">
                  {renderStars(doctor?.rating || 0)}
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor?.email || "n/a"}</span>
                  </div>
                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor?.phone_number || "Phone not available"}</span>
                  </div>

                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">
                      {doctor?.hospital || "n/a"}
                    </span>
                  </div>

                  <div className="flex items-center text-[10px] md:text-[12px] text-gray-800">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor?.address || "n/a"}</span>
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
