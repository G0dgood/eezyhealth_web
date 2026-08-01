import { api } from "./baseApi";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== PAYMENTS MANAGEMENT =====
    getPayments: builder.query({
      async queryFn(arg: { page?: number; limit?: number; search?: string; doctorId?: string; status?: string } = {}) {
        try {
          const { createFirebaseQuery } = await import(
            "@/lib/firebase-rtk"
          );

          let paymentsData = await createFirebaseQuery("payments", []);

          // Apply doctorId filter if present
          if (arg.doctorId) {
            const docId = arg.doctorId;
            paymentsData = paymentsData.filter(
              (p: any) => p.doctorId === docId
            );
          }

          // Apply search filter if present
          if (arg.search) {
            const searchLower = arg.search.toLowerCase();
            paymentsData = paymentsData.filter(
              (p: any) =>
                p.patientName?.toLowerCase().includes(searchLower) ||
                p.paymentReference?.reference?.toLowerCase().includes(searchLower) ||
                p.status?.toLowerCase().includes(searchLower) ||
                p.paymentStatus?.toLowerCase().includes(searchLower)
            );
          }

          // Apply status filter if present
          if (arg.status) {
            const statusFilter = arg.status.toLowerCase();
            paymentsData = paymentsData.filter(
              (p: any) =>
                (p.paymentStatus && p.paymentStatus.toLowerCase() === statusFilter) ||
                (p.status && p.status.toLowerCase() === statusFilter)
            );
          }

          const totalCount = paymentsData.length;

          // Apply page/limit slicing if provided
          let result = paymentsData;
          if (arg.page && arg.limit) {
            const startIndex = (arg.page - 1) * arg.limit;
            result = paymentsData.slice(startIndex, startIndex + arg.limit);
          }

          // Attach pagination properties to the array itself
          const paginatedResult = [...result] as any;
          paginatedResult.totalCount = totalCount;
          paginatedResult.totalPages = arg.limit ? Math.ceil(totalCount / arg.limit) : 1;

          return { data: paginatedResult };
        } catch (error) {
          console.error("Error fetching Firebase payments:", error);
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
      providesTags: ["Payment"],
    }),

    getPaymentsByDoctorId: builder.query({
      async queryFn({ doctorId }) {
        try {
          const { createFirebaseQuery, firebaseConstraints } = await import(
            "@/lib/firebase-rtk"
          );

          const paymentsData = await createFirebaseQuery("payments", [
            firebaseConstraints.where("doctorId", "==", String(doctorId)),
          ]);

          return { data: paymentsData };
        } catch (error) {
          console.error("Error fetching payments by doctor ID:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error
                  ? error.message
                  : "An error occurred while retrieving Payment.",
            },
          };
        }
      },
      providesTags: (_result, _error, { doctorId }) => [
        { type: "Payment", id: doctorId },
      ],
    }),

    createPayment: builder.mutation({
      async queryFn(paymentData) {
        try {
          const { createFirebaseDocument } = await import("@/lib/firebase-rtk");

          const result = await createFirebaseDocument("payments", paymentData);

          return { data: result };
        } catch (error) {
          console.error("Error creating payment:", error);
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
      invalidatesTags: ["Payment"],
    }),

    updatePayment: builder.mutation({
      async queryFn({ id, ...paymentData }) {
        try {
          const { updateFirebaseDocument } = await import("@/lib/firebase-rtk");
          await updateFirebaseDocument("payments", id, paymentData);
          return { data: { id, ...paymentData } };
        } catch (error) {
          console.error("Error updating payment:", error);
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
      invalidatesTags: ["Payment"],
    }),

    deletePayment: builder.mutation({
      async queryFn(id) {
        try {
          const { deleteFirebaseDocument } = await import("@/lib/firebase-rtk");
          await deleteFirebaseDocument("payments", id);
          return { data: { id } };
        } catch (error) {
          console.error("Error deleting payment:", error);
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
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentsByDoctorIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentApi;
