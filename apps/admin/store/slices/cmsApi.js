import { apiSlice } from "../api/apiSlice";

export const cmsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Site Settings
    fetchSiteSettings: builder.query({
      query: () => "/cms/site",
      providesTags: ["cmsSite"],
    }),
    updateSiteSettings: builder.mutation({
      query: (body) => ({
        url: "/cms/site",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["cmsSite"],
    }),

    // Menus
    fetchMenus: builder.query({
      query: () => "/cms/menus",
      providesTags: ["cmsMenus"],
    }),
    fetchMenuByLocation: builder.query({
      query: (location) => `/cms/menus/${location}`,
      providesTags: (result, error, location) => [{ type: "cmsMenus", id: location }],
    }),
    updateMenu: builder.mutation({
      query: ({ location, ...body }) => ({
        url: `/cms/menus/${location}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["cmsMenus"],
    }),

    // Pages
    fetchPages: builder.query({
      query: () => "/cms/pages",
      providesTags: ["cmsPages"],
    }),
    fetchSinglePage: builder.query({
      query: (slug) => `/cms/pages/${slug}`,
      providesTags: (result, error, slug) => [{ type: "cmsPages", id: slug }],
    }),
    createPage: builder.mutation({
      query: (body) => ({
        url: "/cms/pages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cmsPages"],
    }),
    updatePage: builder.mutation({
      query: ({ slug, ...body }) => ({
        url: `/cms/pages/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["cmsPages"],
    }),
    deletePage: builder.mutation({
      query: (slug) => ({
        url: `/cms/pages/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cmsPages"],
    }),

    // FAQs
    fetchFaqs: builder.query({
      query: (all = true) => `/cms/faqs${all ? "?all=true" : ""}`,
      providesTags: ["cmsFaqs"],
    }),
    addFaq: builder.mutation({
      query: (body) => ({
        url: "/cms/faqs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["cmsFaqs"],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/cms/faqs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["cmsFaqs"],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/cms/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cmsFaqs"],
    }),

    // Home Layout
    fetchHomeLayout: builder.query({
      query: () => "/cms/home",
      providesTags: ["cmsHome"],
    }),
    updateHomeLayout: builder.mutation({
      query: (body) => ({
        url: "/cms/home",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["cmsHome"],
    }),

    // Media
    fetchMedia: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.page) q.set("page", params.page);
        if (params.limit) q.set("limit", params.limit);
        if (params.search) q.set("search", params.search);
        if (params.folder) q.set("folder", params.folder);
        const qs = q.toString();
        return `/media${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["cmsMedia"],
    }),
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: "/media",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["cmsMedia"],
    }),
    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["cmsMedia"],
    }),
  }),
});

export const {
  useFetchSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useFetchMenusQuery,
  useFetchMenuByLocationQuery,
  useUpdateMenuMutation,
  useFetchPagesQuery,
  useFetchSinglePageQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useFetchFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useFetchHomeLayoutQuery,
  useUpdateHomeLayoutMutation,
  useFetchMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
} = cmsApi;
