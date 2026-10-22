import { apiSlice } from "../api/apiSlice";

export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchStockMovements: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.productId) queryParams.set("productId", params.productId);
        if (params.variantSku) queryParams.set("variantSku", params.variantSku);
        if (params.reason) queryParams.set("reason", params.reason);
        if (params.page) queryParams.set("page", params.page);
        if (params.limit) queryParams.set("limit", params.limit);
        const qs = queryParams.toString();
        return `/stock/movements${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["stocks"],
    }),

    fetchLowStock: builder.query({
      query: (params = {}) => {
        const threshold = params.threshold || 5;
        return `/stock/low?threshold=${threshold}`;
      },
      providesTags: ["stocks"],
    }),

    adjustStock: builder.mutation({
      query: (data) => ({
        url: "/stock/adjust",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["stocks", "stock", "products", "product", "analytics"],
    }),
  }),
});

export const {
  useFetchStockMovementsQuery,
  useFetchLowStockQuery,
  useAdjustStockMutation,
} = stockApi;
