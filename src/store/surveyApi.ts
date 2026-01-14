import { api } from "./baseApi";

export const surveyApi = api.injectEndpoints({
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


