"use client";

import { motion } from "framer-motion";

const AppointmentTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "incoming" | "past";
  setActiveTab: (filter: "incoming" | "past") => void;
}) => {
  const tabs: { id: "incoming" | "past"; label: string }[] = [
    { id: "incoming", label: "Incoming Appointment" },
    { id: "past", label: "Past Appointment" },
  ];

  return (
    <div className="relative flex items-center gap-2 w-[334px] bg-gray-50 border border-gray-200 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`whitespace-nowrap relative z-10 px-3 py-2 transition-colors font-inter font-semibold text-sm leading-5 
            ${activeTab === tab.id ? "text-white" : "text-gray-600"}`}>
          {tab.label}
          {activeTab === tab.id && (
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

export default AppointmentTabs;
