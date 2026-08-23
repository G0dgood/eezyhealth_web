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
          className={`flex-shrink-0 flex items-center whitespace-nowrap relative px-3 py-2 transition-colors font-inter font-semibold  !text-[10px]  !md:text-[12px] leading-5 rounded-md
            ${activeTab === tab.id ? "text-white" : "text-gray-600"}`}
        >
          {/*
            The pill is rendered BEFORE the label and carries no z-index, so
            normal paint order puts it under the text. It previously used
            `z-[-1]`: framer-motion applies a transform while animating between
            tabs, which makes the pill its own stacking context, and a negative
            z-index child then paints *behind* the container's `bg-gray-50` —
            producing the gray flash across the track mid-animation.
          */}
          {activeTab === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-[#44CE2D] shadow-sm rounded-md"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
          {/* Lifted above the pill so the label stays readable throughout. */}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon && <span className="flex items-center">{tab.icon}</span>}
            <span>{tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default PillTabs;
