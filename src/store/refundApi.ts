import { api } from "./baseApi";

export const refundApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRefunds: builder.query({
      async queryFn(arg: { page?: number; limit?: number; search?: string; status?: string } = {}) {
        try {
          const { createFirebaseQuery } = await import("@/lib/firebase-rtk");

          let refundsData = await createFirebaseQuery("refunds", []);

          // Apply search filter if present
          if (arg.search) {
            const searchLower = arg.search.toLowerCase();
            refundsData = refundsData.filter(
              (r: any) =>
                r.patientName?.toLowerCase().includes(searchLower) ||
                r.doctorName?.toLowerCase().includes(searchLower) ||
                r.reason?.toLowerCase().includes(searchLower)
            );
          }

          // Apply status filter if present
          if (arg.status) {
            const statusFilter = arg.status.toLowerCase();
            refundsData = refundsData.filter(
              (r: any) => r.status?.toLowerCase() === statusFilter
            );
          }

          // Sort by requestedAt descending
          refundsData = refundsData.sort((a: any, b: any) => {
            const timeA = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
            const timeB = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
            return timeB - timeA;
          });

          const totalCount = refundsData.length;

          // Apply page/limit slicing if provided
          let result = refundsData;
          if (arg.page && arg.limit) {
            const startIndex = (arg.page - 1) * arg.limit;
            result = refundsData.slice(startIndex, startIndex + arg.limit);
          }

          // Attach pagination properties to the array itself
          const paginatedResult = [...result] as any;
          paginatedResult.totalCount = totalCount;
          paginatedResult.totalPages = arg.limit ? Math.ceil(totalCount / arg.limit) : 1;

          return { data: paginatedResult };
        } catch (error) {
          console.error("Error fetching Firebase refunds:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["Payment", "Booking"],
    }),

    processRefund: builder.mutation({
      async queryFn({ refundId, bookingId, status, actor }) {
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          // Update refund status in refunds collection
          const refundRef = doc(db, "refunds", refundId);
          await updateDoc(refundRef, {
            status,
            processedAt: new Date().toISOString(),
            processedBy: actor || "nurse",
          });

          // Sync the booking so the doctor's app reflects the outcome (it reads
          // `refundRequestStatus`, which otherwise stays "pending" forever).
          if (bookingId) {
            const bookingRef = doc(db, "Bookings", bookingId);
            const bookingUpdate: Record<string, any> = {
              refundRequestStatus: status, // "refunded" | "rejected"
              updatedAt: new Date().toISOString(),
            };
            if (status === "refunded") {
              bookingUpdate.paymentStatus = "refunded";
              bookingUpdate.bookingStatus = "Refunded";
              bookingUpdate.refundRequested = true;
            }
            await updateDoc(bookingRef, bookingUpdate);
          }

          return { data: { success: true, refundId, status } };
        } catch (error) {
          console.error("Error processing refund:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["Payment", "Booking"],
    }),
  }),
});

export const {
  useGetRefundsQuery,
  useProcessRefundMutation,
} = refundApi;
