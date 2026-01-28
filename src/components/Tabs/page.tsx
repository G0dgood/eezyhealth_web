"use client";

import { motion } from "framer-motion";

const BookingListTabs = ({
  bookingsTab,
  setBookingsTab,
}: {
  bookingsTab: "Booking" | "Booking List";
  setBookingsTab: (filter: "Booking" | "Booking List") => void;
}) => {
  const tabs: { id: "Booking" | "Booking List"; label: string }[] = [
    { id: "Booking", label: "Booking" },
    { id: "Booking List", label: "Booking List" },
  ];

  return (
    <div className="relative flex items-center gap-2 w-[197px] bg-gray-50 border border-gray-200 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setBookingsTab(tab.id)}
          className={`whitespace-nowrap relative z-10 px-3 py-2 transition-colors font-inter font-semibold  !text-[10px]  !md:text-[12px] leading-5 
            ${bookingsTab === tab.id ? "text-white" : "text-gray-600"}`}>
          {tab.label}
          {bookingsTab === tab.id && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-[#44CE2D] border border-[#44CE2D] shadow-sm rounded-lg z-[-1]"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default BookingListTabs;
