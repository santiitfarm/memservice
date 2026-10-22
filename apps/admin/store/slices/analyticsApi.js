import { apiSlice } from "../api/apiSlice";

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchAnalyticsSummary: builder.query({
      query: (range = "30d") => `/analytics/summary?range=${range}`,
      providesTags: ["analytics", "orders"],
    }),
  }),
});

export const { useFetchAnalyticsSummaryQuery } = analyticsApi;
