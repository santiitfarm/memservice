import { apiSlice } from "../api/apiSlice";

export const docCategoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchDocCategories: builder.query({
      query: () => "/doccat",
      providesTags: ["doccategories"],
    }),

    addDocCategory: builder.mutation({
      query: (category) => ({
        url: "/doccat",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["doccategories"],
    }),

    updateDocCategory: builder.mutation({
      query: (category) => ({
        url: `/doccat`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: ["doccategories"],
    }),
  }),
});

export const {
  useAddDocCategoryMutation,
  useUpdateDocCategoryMutation,
  useFetchDocCategoriesQuery,
} = docCategoriesApi;
