"use client";

// Reuses the same availability calendar as the nurse side. The shared page
// derives its breadcrumb from the URL, so it renders as "Admin › Availability"
// here. Admin picks a doctor to view/set their availability.
import NurseAvailabilityPage from "@/app/nurse/availability/page";

export default function AdminAvailabilityPage() {
  return <NurseAvailabilityPage />;
}
