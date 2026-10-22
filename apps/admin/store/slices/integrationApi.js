import { apiSlice } from "../api/apiSlice";

export const integrationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchIntegrations: builder.query({
      query: (category) =>
        `/integrations${category ? `?category=${category}` : ""}`,
      providesTags: ["integrations"],
    }),

    fetchSingleIntegration: builder.query({
      query: (key) => `/integrations/${key}`,
      providesTags: (result, error, key) => [{ type: "integrations", id: key }],
    }),

    updateIntegration: builder.mutation({
      query: ({ key, ...body }) => ({
        url: `/integrations/${key}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["integrations"],
    }),

    testIntegration: builder.mutation({
      query: (key) => ({
        url: `/integrations/${key}/test`,
        method: "POST",
      }),
      invalidatesTags: ["integrations"],
    }),
  }),
});

export const {
  useFetchIntegrationsQuery,
  useFetchSingleIntegrationQuery,
  useUpdateIntegrationMutation,
  useTestIntegrationMutation,
} = integrationApi;
