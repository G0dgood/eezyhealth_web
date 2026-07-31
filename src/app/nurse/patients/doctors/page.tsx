"use client";

import React from "react";
import { Star, Mail, Phone, User, ArrowLeft, MapPin } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetFirebaseDoctorProfilesQuery } from "@/store/doctorFirebaseApi";
import { topDoctorColors, topDoctorMainColors } from "@/components/Options";
import DoctorSkeletonLoader from "@/components/skeletons/DoctorSkeletonLoader";

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

// Type guard to check if a value is a number
const isNumber = (value: unknown): value is number => typeof value === "number";

export default function NursesDoctorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientName = searchParams.get("patient");

  // Fetch doctors using RTK
  const {
    data: doctorsData = [],
    isLoading,
    isError,
  } = useGetFirebaseDoctorProfilesQuery({});

  // Transform the data to match our Doctor interface
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

  // Use fetched doctors data
  const dataSource = transformedDoctors;

  // Determine top doctors (either by isTop flag or by rating)
  const topDoctors = dataSource.filter(
    (d) => d.isTop || (isNumber(d.rating) && d.rating >= 4.5)
  );
  const regularDoctors = dataSource
    .filter((d) => !d.isTop && (!isNumber(d.rating) || d.rating < 4.5))
    .slice(0, 4); // Show first 4 as regular doctors

  // Handle errors and success with Sonner toast

  const renderStars = (rating: number) => {
    if (!rating) return null;
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

  const handleBookAppointment = (doctor: Doctor) => {
    // Navigate to booking page with doctor and patient info
    const patientId = searchParams.get("patientId");
    const bookingUrl = `/nurse/patients/book-appointment/${doctor.doctorId || doctor.id
      }?patient=${encodeURIComponent(patientName || "")}&patientId=${patientId}`;
    router.push(bookingUrl);
  };

  if (isLoading) {
    return <DoctorSkeletonLoader patientName={patientName} />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Failed to load doctors
        </h2>
        <p className="text-gray-600 mb-6">
          Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/nurse/patients"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Select Doctor for{" "}
            {patientName ? `Patient: ${patientName}` : "Patient"}
          </h1>
        </div>

        <Breadcrumb
          items={[
            { label: "Nurse Dashboard", href: "/nurse" },
            { label: "Patients", href: "/nurse/patients" },
            { label: "Select Doctor" },
          ]}
        />
      </div>

      <Title title="Doctor Management" />

      {/* Top Doctors Section */}
      <div className="mb-12 cursor-pointer">
        <h2 className="text-2xl font-semibold mb-6">Top Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`${topDoctorColors[index]} rounded-lg p-6 relative overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200`}
            >
              {/* Top Doctor Banner */}
              <div
                className={`${topDoctorMainColors[index]} absolute top-[110px] left-[-30px] text-[#fff] px-3 py-1 w-[200px] text-xs font-bold transform -rotate-45 origin-top-left text-center font-inter text-[12px] leading-[15px]  
         tracking-[0.5px]`}
              >
                Top Doctor
              </div>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white">
                  <Image
                    src={
                      doctor?.photo_url ||
                      doctor?.image ||
                      "/api/placeholder/120/120"
                    }
                    alt={doctor.display_name || "Doctor"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-bold text-[14px] md:text-[16px] mb-2 text-gray-900">
                  {doctor.title || `${doctor.title}`.trim() || "N/A"}
                </h3>
                <p className=" text-[10px]  md:text-[12px] text-gray-600 mb-2">
                  {doctor.display_name?.trim() || ""}
                </p>
                <p className=" text-[10px]  md:text-[12px] text-gray-600 mb-2">
                  {`${doctor.first_name || ""}  ${doctor.last_name || ""
                    }`.trim() || ""}
                </p>

                <div className="flex items-center justify-center mb-3">
                  {renderStars(doctor.rating || 0)}
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor.phone_number || "Phone not available"}</span>
                  </div>

                  {doctor.hospital && (
                    <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                      <User className="w-4 h-4 mr-2" />
                      <span className="truncate">{doctor.hospital}</span>
                    </div>
                  )}

                  {doctor.address && (
                    <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{doctor.address}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookAppointment(doctor);
                    }}
                    className={`${topDoctorMainColors[index]} t  btn-primary-green flex-1 px-3 py-2 rounded-lg  text-[10px]  md:text-[12px] font-medium cursor-pointer`}
                  >
                    Book Appointment
                  </button>
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
              className="bg-white rounded-lg p-6 border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={
                      (doctor.photo_url &&
                        !doctor.photo_url.startsWith("file://")) ||
                        (doctor.image && !doctor.image.startsWith("file://"))
                        ? doctor.photo_url ||
                        doctor.image ||
                        "/api/placeholder/120/120"
                        : "/api/placeholder/120/120"
                    }
                    alt={doctor?.display_name || "Doctor"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/120/120";
                    }}
                  />
                </div>

                <h3 className="font-bold text-[14px] md:text-[16px] mb-2 text-gray-900">
                  {doctor.display_name || `${doctor.title}`.trim() || "N/A"}
                </h3>
                <p className=" text-[10px]  md:text-[12px] text-gray-600 mb-2">
                  {doctor.display_name?.trim() || "N/A"}
                </p>
                <p className=" text-[10px]  md:text-[12px] text-gray-600 mb-2">
                  {`${doctor.first_name || ""} ${doctor.last_name || ""
                    }`.trim() || "N/A"}
                </p>
                <p className=" text-[10px]  md:text-[12px] text-gray-600 mb-2">
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
                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor?.email || "n/a"}</span>
                  </div>
                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{doctor?.phone_number || "Phone not available"}</span>
                  </div>

                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <User className="w-4 h-4 mr-2" />
                    <span className="truncate">
                      {doctor?.hospital || "n/a"}
                    </span>
                  </div>

                  <div className="flex items-center  text-[10px]  md:text-[12px] text-gray-800">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor?.address || "n/a"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookAppointment(doctor);
                    }}
                    className="btn-primary-green flex-1 px-3 py-2 rounded-lg  text-[10px]  md:text-[12px] font-medium cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
