"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import BookingListTabs from "@/components/Tabs/page";
import BookingList from "./components/BookingList";
import Bookings from "./components/Bookings";
import Title from "@/components/Title";

export default function NurseBookingsPage() {
  const [bookingsTab, setBookingsTab] = useState<"Booking" | "Booking List">(
    "Booking",
  );

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
          <BookingListTabs
            bookingsTab={bookingsTab}
            setBookingsTab={setBookingsTab}
          />
        </div>
      </div>
      {bookingsTab === "Booking" && <Bookings />}
      {bookingsTab === "Booking List" && <BookingList />}
    </div>
  );
}
