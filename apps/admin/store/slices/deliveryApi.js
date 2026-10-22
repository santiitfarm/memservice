import { apiSlice } from "../api/apiSlice";

export const deliveryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchDeliveryZones: builder.query({
      query: (all = true) => `/delivery/zones${all ? "?all=true" : ""}`,
      providesTags: ["deliveryZones"],
    }),

    addDeliveryZone: builder.mutation({
      query: (zone) => ({
        url: "/delivery/zones",
        method: "POST",
        body: zone,
      }),
      invalidatesTags: ["deliveryZones"],
    }),

    updateDeliveryZone: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/delivery/zones/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["deliveryZones"],
    }),

    deleteDeliveryZone: builder.mutation({
      query: (id) => ({
        url: `/delivery/zones/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["deliveryZones"],
    }),

    calculateQuote: builder.mutation({
      query: (body) => ({
        url: "/delivery/quote",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useFetchDeliveryZonesQuery,
  useAddDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useCalculateQuoteMutation,
} = deliveryApi;
