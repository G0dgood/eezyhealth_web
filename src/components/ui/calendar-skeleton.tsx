import { Skeleton } from "./skeleton";

export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3"></div>
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="p-3 text-center">
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {Array.from({ length: 12 }).map((_, slotIndex) => (
            <div
              key={slotIndex}
              className="grid grid-cols-8 border-b border-gray-200 last:border-b-0"
            >
              {/* Time Label */}
              <div className="p-3 flex items-center justify-center border-r border-gray-200">
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Day Columns */}
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="p-3 border-r border-gray-200 last:border-r-0"
                >
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}