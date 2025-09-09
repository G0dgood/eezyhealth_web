import { Skeleton } from "./skeleton";

export function DoctorBookingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Doctor's Profile Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center">
            {/* Profile Picture Skeleton */}
            <div className="w-32 h-32 mx-auto mb-4">
              <Skeleton className="w-full h-full rounded-full" />
            </div>

            {/* Doctor Info Skeleton */}
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-6 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto mb-3" />

            {/* Rating Skeleton */}
            <div className="flex justify-center space-x-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-5" />
              ))}
            </div>

            {/* Contact Info Skeleton */}
            <div className="space-y-2 text-left mb-4">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* About Section Skeleton */}
            <div className="text-left">
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Right Panel - Appointment Booking Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <Skeleton className="h-7 w-48 mb-6" />

          {/* Communication Channel Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Available Date Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Calendar Header Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              {/* Days of Week Skeleton */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-8 mx-auto" />
                ))}
              </div>

              {/* Calendar Days Skeleton */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Available Times Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-40 mb-2" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Reason for Consultation Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="text-right mt-1">
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          </div>

          {/* Continue Button Skeleton */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
