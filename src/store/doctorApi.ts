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

    getDoctorsBySpecializationCount: builder.query({
      query: (params) => ({
        url: "/getDoctorsBySpecializationCount",
        params,
      }),
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


