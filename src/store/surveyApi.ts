import { api, ALLOW_HMR_REINJECT } from "./baseApi";

export const surveyApi = api.injectEndpoints({
  overrideExisting: ALLOW_HMR_REINJECT,
  endpoints: (builder) => ({
    // ===== SURVEYS & COMMENTS =====
    submitSurvey: builder.mutation({
      query: (surveyData) => ({
        url: "/submitSurvey",
        method: "POST",
        body: surveyData,
      }),
      invalidatesTags: ["Survey"],
    }),

    makeComment: builder.mutation({
      query: (commentData) => ({
        url: "/makeComment",
        method: "POST",
        body: commentData,
      }),
    }),
  }),
});

export const {
  useSubmitSurveyMutation,
  useMakeCommentMutation,
} = surveyApi;


