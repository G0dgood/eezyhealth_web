"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  onTodayClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Calendar({
  currentWeekStart,
  onWeekChange,
  onTodayClick,
  children,
  className = "",
}: CalendarProps) {
  const getCurrentMonth = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[currentWeekStart.getMonth()];
    const year = currentWeekStart.getFullYear();
    return `${month}, ${year}`;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart);

    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7);
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    }

    onWeekChange(newWeekStart);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
            {getCurrentMonth()}
          </h3>
          <p className=" !text-[10px]  !md:text-[12px] text-gray-500">
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(
              currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTodayClick}
            className="px-3 py-1  !text-[10px]  !md:text-[12px] bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
            Today
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {children}
    </div>
  );
}
