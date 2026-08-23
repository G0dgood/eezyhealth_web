import { api, ALLOW_HMR_REINJECT } from "./baseApi";

export const adminApi = api.injectEndpoints({
  overrideExisting: ALLOW_HMR_REINJECT,
  endpoints: (builder) => ({
    // ===== ADMIN DASHBOARD =====
    getAdminDashboard: builder.query({
      query: (params) => ({
        url: "/getAdminDashboard",
        params,
      }),
    }),

    // ===== CONTACTS =====
    getContacts: builder.query({
      query: (params) => ({
        url: "/getContacts",
        params,
      }),
      providesTags: ["Contacts"],
    }),

    updateContactStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: "/updateContactStatus",
        method: "POST",
        body: { id, status },
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetContactsQuery,
  useUpdateContactStatusMutation,
} = adminApi;


