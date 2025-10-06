"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

interface DoctorSkeletonLoaderProps {
	patientName?: string | null;
}

const DoctorSkeletonLoader: React.FC<DoctorSkeletonLoaderProps> = ({ patientName }) => {
	return (
		<div>
			<div className="mb-6">
				<div className="flex items-center space-x-4 mb-4">
					<Link
						href="/nurse/patients"
						className="text-gray-600 hover:text-gray-900 transition-colors">
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

			<div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

			{/* Top Doctors Section Skeleton */}
			<div className="mb-12">
				<div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map((index) => (
						<div
							key={index}
							className="bg-gray-100 rounded-lg p-6 relative overflow-hidden animate-pulse">
							{/* Top Doctor Banner Skeleton */}
							<div className="absolute top-[110px] left-[-30px] bg-gray-300 w-[200px] h-6 transform -rotate-45 origin-top-left"></div>

							<div className="text-center">
								{/* Profile Image Skeleton */}
								<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300"></div>

								{/* Name and Title Skeleton */}
								<div className="h-5 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
								<div className="h-4 bg-gray-300 rounded w-24 mx-auto mb-2"></div>
								<div className="h-4 bg-gray-300 rounded w-28 mx-auto mb-2"></div>

								{/* Rating Stars Skeleton */}
								<div className="flex items-center justify-center mb-3">
									<div className="flex space-x-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<div key={star} className="w-4 h-4 bg-gray-300 rounded"></div>
										))}
									</div>
								</div>

								{/* Contact Info Skeleton */}
								<div className="space-y-2 text-left">
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
										<div className="h-4 bg-gray-300 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
										<div className="h-4 bg-gray-300 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
										<div className="h-4 bg-gray-300 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
										<div className="h-4 bg-gray-300 rounded flex-1"></div>
									</div>
								</div>

								{/* Button Skeleton */}
								<div className="mt-4">
									<div className="h-10 bg-gray-300 rounded-lg"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Regular Doctors Section Skeleton */}
			<div>
				<div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map((index) => (
						<div
							key={index}
							className="bg-white rounded-lg p-6 shadow-lg animate-pulse">
							<div className="text-center">
								{/* Profile Image Skeleton */}
								<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200"></div>

								{/* Name and Info Skeleton */}
								<div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-28 mx-auto mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-36 mx-auto mb-3"></div>

								{/* Rating Stars Skeleton */}
								<div className="flex items-center justify-center mb-3">
									<div className="flex space-x-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
										))}
									</div>
								</div>

								{/* Contact Info Skeleton */}
								<div className="space-y-2 text-left">
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
										<div className="h-4 bg-gray-200 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
										<div className="h-4 bg-gray-200 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
										<div className="h-4 bg-gray-200 rounded flex-1"></div>
									</div>
									<div className="flex items-center">
										<div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
										<div className="h-4 bg-gray-200 rounded flex-1"></div>
									</div>
								</div>

								{/* Button Skeleton */}
								<div className="mt-4">
									<div className="h-10 bg-gray-200 rounded-lg"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default DoctorSkeletonLoader;
