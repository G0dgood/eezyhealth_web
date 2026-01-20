import { api } from "./baseApi";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ===== AUTHENTICATION & USER MANAGEMENT =====
    generateTokenForUser: builder.mutation({
      query: (credentials) => ({
        url: "/generateTokenForUser",
        method: "POST",
        body: credentials,
      }),
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: "/createUser",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUserById: builder.query({
      query: (userId) => ({
        url: "/getUserById",
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),

    updateUser: builder.mutation({
      async queryFn({ userId, ...userData }) {
        try {
          const { updateFirebaseDocument, getFirebaseInstance } = await import(
            "@/lib/firebase-rtk"
          );
          const { collection, query, where, getDocs, updateDoc } = await import(
            "firebase/firestore"
          );

          // 1. Update users collection (Always)
          await updateFirebaseDocument("users", userId, userData);

          // 2. Handle Role Specific Updates
          const db = getFirebaseInstance();
          const role = userData.role;

          if (role === "nurse") {
            // Update nurseProfiles
            const q = query(
              collection(db, "nurseProfiles"),
              where("nurseId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          } else if (role === "doctor") {
            // Update doctorProfiles
            const q = query(
              collection(db, "doctorProfiles"),
              where("doctorId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          }

          return { data: { userId, ...userData } };
        } catch (error) {
          console.error("Error updating user profile:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error ? error.message : "Failed to update profile",
            },
          };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),

    updateUserProfile: builder.mutation({
      async queryFn({ userId, ...userData }) {
        try {
          const { updateFirebaseDocument, getFirebaseInstance } = await import(
            "@/lib/firebase-rtk"
          );
          const { collection, query, where, getDocs, updateDoc, doc, getDoc } = await import(
            "firebase/firestore"
          );

          // 1. Update users collection (Always)
          await updateFirebaseDocument("users", userId, userData);

          // 2. Handle Role Specific Updates
          const db = getFirebaseInstance();
          let role = userData.role;

          // If role is not provided, try to fetch it from the user document
          if (!role) {
            try {
              const userDocRef = doc(db, "users", userId);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                role = userSnap.data().role;
              }
            } catch (err) {
              console.warn("Could not fetch user role for profile sync:", err);
            }
          }

          if (role === "nurse") {
            // Update nurseProfiles
            const q = query(
              collection(db, "nurseProfiles"),
              where("nurseId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          } else if (role === "doctor") {
            // Update doctorProfiles
            const q = query(
              collection(db, "doctorProfiles"),
              where("doctorId", "==", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const updatePromises = querySnapshot.docs.map((doc) =>
                updateDoc(doc.ref, userData)
              );
              await Promise.all(updatePromises);
            }
          }

          return { data: { userId, ...userData } };
        } catch (error) {
          console.error("Error updating user profile:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                error instanceof Error ? error.message : "Failed to update profile",
            },
          };
        }
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
      ],
    }),

    getUsers: builder.query({
      query: (params) => ({
        url: "/getUsers",
        params,
      }),
      providesTags: ["User"],
    }),

    getUsersByRole: builder.query({
      query: (role) => ({
        url: "/getUsersByRole",
        params: { role },
      }),
      providesTags: ["User"],
    }),

    emailVerification: builder.mutation({
      query: (emailData) => ({
        url: "/emailVerification",
        method: "POST",
        body: emailData,
      }),
    }),

    sendPasswordResetLink: builder.mutation({
      query: (emailData) => ({
        url: "/sendPasswordResetLink",
        method: "POST",
        body: emailData,
      }),
    }),

    sendWelcomeEmail: builder.mutation({
      query: (emailData) => ({
        url: "/sendWelcomeEmail",
        method: "POST",
        body: emailData,
      }),
    }),

    getProfileImageUrl: builder.query({
      query: (userId) => ({
        url: "/getProfileImageUrl",
        params: { userId },
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
  }),
});

export const {
  useGenerateTokenForUserMutation,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserProfileMutation,
  useGetUsersQuery,
  useGetUsersByRoleQuery,
  useEmailVerificationMutation,
  useSendPasswordResetLinkMutation,
  useSendWelcomeEmailMutation,
  useGetProfileImageUrlQuery,
} = authApi;


