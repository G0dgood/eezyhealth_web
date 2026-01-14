import { api } from "./baseApi";

export const specializationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== SPECIALIZATION MANAGEMENT =====
    getSpecializations: builder.query({
      async queryFn() {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

          const specializationsData = await createFirebaseQuery(
            "specialization"
          );

          return { data: specializationsData };
        } catch (error) {
          console.error("Error fetching Firebase specializations:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Specialization"],
    }),

    createSpecialization: builder.mutation({
      async queryFn(specializationData) {
        try {
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const result = await createFirebaseDocument(
            "specialization",
            specializationData
          );

          return { data: result };
        } catch (error) {
          console.error("Error creating specialization:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Specialization"],
    }),

    updateSpecialization: builder.mutation({
      async queryFn({ id, ...specializationData }) {
        try {
          const { updateFirebaseDocument } = await import("@/lib/firebase-rtk");

          await updateFirebaseDocument(
            "specialization",
            id,
            specializationData
          );

          return { data: { id, ...specializationData } };
        } catch (error) {
          console.error("Error updating specialization:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Specialization"],
    }),

    deleteSpecialization: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import("@/lib/firebase-rtk");

          await deleteFirebaseDocument("specialization", id);

          return { data: { id } };
        } catch (error) {
          console.error("Error deleting specialization:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Specialization"],
    }),
  }),
});

export const {
  useGetSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
} = specializationApi;


