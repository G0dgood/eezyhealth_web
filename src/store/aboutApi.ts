import { api } from "./baseApi";

// The `aboutus` collection is read by the mobile apps by merging every document
// (later docs override earlier ones on key collisions). To keep the admin
// editor authoritative we read that same merged view and write back to the
// last document (or create "main" when the collection is empty), so the values
// the admin saves always win the merge on the client.

export interface AboutUsData {
  aboutus?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  updatedAt?: string;
}

export const aboutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAbout: builder.query<AboutUsData & { _targetId: string }, void>({
      async queryFn() {
        try {
          const { collection, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const snap = await getDocs(collection(db, "aboutus"));
          if (snap.empty) {
            return { data: { _targetId: "main" } };
          }

          const merged = Object.assign(
            {},
            ...snap.docs.map((d) => d.data())
          ) as AboutUsData;

          // Write target = the doc that wins the client-side merge (the last one).
          const _targetId = snap.docs[snap.docs.length - 1].id;
          return { data: { ...merged, _targetId } };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      providesTags: ["About"],
    }),

    updateAbout: builder.mutation<{ success: boolean }, AboutUsData>({
      async queryFn(fields) {
        try {
          const { collection, getDocs, doc, setDoc } = await import(
            "firebase/firestore"
          );
          const { db } = await import("@/lib/firebase");

          const snap = await getDocs(collection(db, "aboutus"));
          const targetId = snap.empty
            ? "main"
            : snap.docs[snap.docs.length - 1].id;

          await setDoc(
            doc(db, "aboutus", targetId),
            {
              aboutus: fields.aboutus ?? "",
              // keep `description` in sync so older readers still resolve content
              description: fields.aboutus ?? "",
              address: fields.address ?? "",
              phone: fields.phone ?? "",
              email: fields.email ?? "",
              website: fields.website ?? "",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: "FETCH_ERROR",
              error:
                error instanceof Error ? error.message : "Unknown error occurred",
            },
          };
        }
      },
      invalidatesTags: ["About"],
    }),
  }),
});

export const { useGetAboutQuery, useUpdateAboutMutation } = aboutApi;
