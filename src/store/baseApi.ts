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



/**
 * RTK Query logs "called `injectEndpoints` to override already-existing
 * endpointName … without specifying `overrideExisting: true`" whenever a slice
 * module is evaluated more than once. Next.js Fast Refresh does exactly that on
 * every edit, so the warning is dev-only noise, not a real duplicate endpoint.
 *
 * Allow re-injection in development to silence it, while keeping the default
 * (warn) in production builds so a genuine duplicate endpoint name still shows.
 */
export const ALLOW_HMR_REINJECT = process.env.NODE_ENV === "development";
