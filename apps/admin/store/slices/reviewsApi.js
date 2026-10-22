import { apiSlice } from "../api/apiSlice";

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchReviews: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.set("status", params.status);
        if (params.product) q.set("product", params.product);
        if (params.page) q.set("page", params.page);
        if (params.limit) q.set("limit", params.limit);
        const qs = q.toString();
        return `/reviews${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["reviews"],
    }),

    updateReviewStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["reviews"],
    }),
  }),
});

export const {
  useFetchReviewsQuery,
  useUpdateReviewStatusMutation,
} = reviewsApi;
