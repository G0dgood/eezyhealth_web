import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NODE_ENV === "development"
        ? "/api" // Use local proxy in development
        : process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Booking",
    "Appointment",
    "Patient",
    "Payment",
    "User",
    "Doctor",
    "Nurse",
    "Upload",
    "AuditLog",
    "Notification",
    "Survey",
    "BookingCancellation",
    "DoctorOfTheMonth",
    "Specialization",
    "PatientAppointments",
    "PatientVitals",
    "Contacts",
    "Pricing",
    "About",
  ],
  endpoints: () => ({}),
});


