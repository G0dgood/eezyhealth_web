"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PillTabs from "@/components/Tabs/PillTabs";
import BookingList from "./components/BookingList";
import Bookings from "./components/Bookings";
import Title from "@/components/Title";

export default function NurseBookingsPage() {
  const [bookingsTab, setBookingsTab] = useState<"Booking" | "Booking List">(
    "Booking",
  );

  const tabs = [
    { id: "Booking", label: "Booking" },
    { id: "Booking List", label: "Booking List" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Nurse", href: "/nurse" }, { label: "Booking List" }]}
      />

      {/* Header */}
      <div className="mb-6">
        <Title title={bookingsTab} />
        <p className="text-gray-600 mb-4">
          Manage and schedule patient appointments
        </p>
        <div className="flex flex-row items-center justiful-center w-full mb-2">
          <PillTabs
            tabs={tabs}
            activeTab={bookingsTab}
            onTabChange={(id) => setBookingsTab(id as "Booking" | "Booking List")}
          />
        </div>
      </div>
      {bookingsTab === "Booking" && <Bookings />}
      {bookingsTab === "Booking List" && <BookingList />}
    </div>
  );
}
