import { api } from "./baseApi";

export const doctorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== DOCTOR MANAGEMENT =====
    createDoctor: builder.mutation({
      query: (doctorData) => ({
        url: "/createDoctor",
        method: "POST",
        body: doctorData,
      }),
      invalidatesTags: ["Doctor"],
    }),

    getDoctorById: builder.query({
      query: (doctorId) => ({
        url: "/getDoctorById",
        params: { doctorId },
      }),
      providesTags: (result, error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    updateDoctor: builder.mutation({
      query: ({ doctorId, ...doctorData }) => ({
        url: "/updateDoctor",
        method: "PUT",
        body: { doctorId, ...doctorData },
      }),
      invalidatesTags: (result, error, { doctorId }) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    getDoctors: builder.query({
      query: (params) => ({
        url: "/getDoctors",
        params,
      }),
      providesTags: ["Doctor"],
    }),

    getActiveDoctors: builder.query({
      query: (params) => ({
        url: "/getActiveDoctors",
        params,
      }),
      providesTags: ["Doctor"],
    }),

    getDoctorsBySpecialization: builder.query({
      query: (specialization) => ({
        url: "/getDoctorsBySpecialization",
        params: { specialization },
      }),
      providesTags: ["Doctor"],
    }),

    // Counts doctors for a specialization directly against Firestore. This used
    // to hit a `getDoctorsBySpecializationCount` Cloud Function that was never
    // deployed, so the request 404'd — and a 404 carries no CORS header, which
    // the browser surfaced as a CORS error. Querying the client SDK removes the
    // server dependency (and the CORS failure) entirely.
    getDoctorsBySpecializationCount: builder.query({
      async queryFn(arg: { specializationId?: string } = {}) {
        try {
          const specializationId = arg?.specializationId;
          if (!specializationId) return { data: { count: 0 } };

          const { collection, getDocs, query, where } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const snapshot = await getDocs(
            query(
              collection(db, "users"),
              where("specializationId", "==", specializationId)
            )
          );

          // Role casing varies across records ("DOCTOR"/"doctor"), so match
          // case-insensitively.
          const count = snapshot.docs.filter((d) => {
            const role = String((d.data() as { role?: string }).role || "")
              .toLowerCase();
            return role === "doctor";
          }).length;

          return { data: { count } };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      providesTags: ["Doctor"],
    }),

    updateDoctorAvailability: builder.mutation({
      query: ({ doctorId, availability }) => ({
        url: "/updateDoctorAvailability",
        method: "PUT",
        body: { doctorId, availability },
      }),
      invalidatesTags: (result, error, { doctorId }) => [
        { type: "Doctor", id: doctorId },
      ],
    }),

    rateDoctor: builder.mutation({
      query: (ratingData) => ({
        url: "/rateDoctor",
        method: "POST",
        body: ratingData,
      }),
      invalidatesTags: ["Doctor"],
    }),
  }),
});

export const {
  useCreateDoctorMutation,
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
  useGetDoctorsQuery,
  useGetActiveDoctorsQuery,
  useGetDoctorsBySpecializationQuery,
  useGetDoctorsBySpecializationCountQuery,
  useUpdateDoctorAvailabilityMutation,
  useRateDoctorMutation,
} = doctorApi;


