import { apiSlice } from "../api/apiSlice";

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchCoupons: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.search) q.set("search", params.search);
        if (params.status) q.set("status", params.status);
        const qs = q.toString();
        return `/coupons${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["coupons"],
    }),

    addCoupon: builder.mutation({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["coupons"],
    }),

    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/coupons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["coupons"],
    }),

    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupons"],
    }),
  }),
});

export const {
  useFetchCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
