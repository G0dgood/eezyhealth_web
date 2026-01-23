"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: any) => void;
  layoutId?: string;
  className?: string;
}

const PillTabs = ({
  tabs,
  activeTab,
  onTabChange,
  layoutId = "active-pill",
  className = "",
}: PillTabsProps) => {
  return (
    <div
      className={`relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg w-fit max-w-full overflow-x-auto p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-shrink-0 flex items-center gap-2 whitespace-nowrap relative z-10 px-3 py-2 transition-colors font-inter font-semibold text-sm leading-5 rounded-md
            ${activeTab === tab.id ? "text-white" : "text-gray-600"}`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-[#44CE2D] shadow-sm rounded-md z-[-1]"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default PillTabs;
