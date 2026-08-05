import { api } from "./baseApi";

/**
 * Global booking price. Single source of truth stored in the `pricings`
 * Firestore collection (field `pricing`). The mobile app reads
 * `pricings[0].pricing` for the doctor profile, booking summary and Paystack
 * amount, so writing it here reflects everywhere.
 */
export const pricingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Read the current global booking price.
    getPricing: builder.query({
      async queryFn() {
        try {
          const { collection, getDocs, query, limit } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const snap = await getDocs(
            query(collection(db, "pricings"), limit(1))
          );
          const empty: { id: string | null; pricing: number } = {
            id: null,
            pricing: 0,
          };
          if (snap.empty) return { data: empty };

          const first = snap.docs[0];
          const data = first.data() as any;
          // Return only serializable fields — the raw doc carries Firestore
          // Timestamp objects (createdAt/updatedAt) which Redux flags as
          // non-serializable if spread into state.
          const result: { id: string | null; pricing: number } = {
            id: first.id,
            pricing: Number(data.pricing) || 0,
          };
          return { data: result };
        } catch (error) {
          console.error("Error fetching pricing:", error);
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      },
      providesTags: ["Pricing"],
    }),

    // Set the global booking price. Updates the existing pricings doc (so the
    // mobile app's `pricings[0]` picks it up) or creates one if none exists.
    setPricing: builder.mutation({
      async queryFn({ pricing }) {
        try {
          const { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } =
            await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          // Store a clean integer (naira). Commas would break Number()/Paystack.
          const value = Math.max(
            0,
            Math.round(Number(String(pricing).replace(/[,\s]/g, "")) || 0)
          );

          const snap = await getDocs(collection(db, "pricings"));

          if (!snap.empty) {
            // Update every pricing doc so the mobile app's `pricings[0]` — whichever
            // doc that resolves to — always reflects the new price.
            await Promise.all(
              snap.docs.map((d) =>
                updateDoc(doc(db, "pricings", d.id), {
                  pricing: value,
                  updatedAt: serverTimestamp(),
                })
              )
            );
          } else {
            await setDoc(doc(db, "pricings", "global"), {
              pricing: value,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          return { data: { success: true, pricing: value } };
        } catch (error: any) {
          console.error("Error setting pricing:", error);
          return {
            error: {
              status: error?.code || "CUSTOM_ERROR",
              error: error?.message || "Failed to update price.",
            },
          };
        }
      },
      invalidatesTags: ["Pricing"],
    }),
  }),
});

export const { useGetPricingQuery, useSetPricingMutation } = pricingApi;
