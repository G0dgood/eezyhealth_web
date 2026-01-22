import React from "react";
import PillTabs from "./PillTabs";

interface AppointmentTabsProps {
  activeTab: "incoming" | "past";
  setActiveTab: (tab: "incoming" | "past") => void;
}

const AppointmentTabs = ({ activeTab, setActiveTab }: AppointmentTabsProps) => {
  return (
    <PillTabs
      tabs={[
        { id: "incoming", label: "Incoming Appointment" },
        { id: "past", label: "Past Appointment" },
      ]}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "incoming" | "past")}
    />
  );
};

export default AppointmentTabs;
