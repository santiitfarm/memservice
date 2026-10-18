import { apiSlice } from "../api/apiSlice";

export const bannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchBanners: builder.query({
      query: () => "/banner",
      providesTags: ["banners"],
    }),
    addBanner: builder.mutation({
      query: (banner) => ({
        url: "/banner",
        method: "POST",
        body: banner,
      }),
      invalidatesTags: ["banners"],
    }),
    updateBanner: builder.mutation({
      query: (banner) => ({
        url: `/banner`,
        method: "PUT",
        body: banner,
      }),
      invalidatesTags: ["banners"],
    }),

    deleteBanner: builder.mutation({
      query: (bannerId) => ({
        url: `/banner`,
        method: "DELETE",
        body: bannerId,
      }),
      invalidatesTags: ["banners"],
    }),
  }),
});

export const {
  useFetchBannersQuery,
  useAddBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
