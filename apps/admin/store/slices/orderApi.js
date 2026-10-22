import { apiSlice } from "../api/apiSlice";

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchOrders: builder.query({
      query: () => "/order",
      providesTags: ["orders"],
    }),
    fetchSingleOrders: builder.query({
      query: (id) => `/order/${id}`,
      providesTags: ["order"],
    }),
    addOrder: builder.mutation({
      query: (order) => ({
        url: "/order",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["orders"],
    }),

    updateOrder: builder.mutation({
      query: (order) => ({
        url: `/order/${order._id}`,
        method: "PUT",
        body: order,
      }),
      invalidatesTags: ["orders", "order"],
    }),

    bookCourier: builder.mutation({
      query: ({ orderId, ...body }) => ({
        url: `/order/${orderId}/shipment`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["orders", "order"],
    }),

    verifyPayment: builder.mutation({
      query: ({ orderId, payment_info }) => ({
        url: `/order/${orderId}`,
        method: "PUT",
        body: { payment_info },
      }),
      invalidatesTags: ["orders", "order"],
    }),
  }),
});

export const {
  useFetchOrdersQuery,
  useFetchSingleOrdersQuery,
  useAddOrderMutation,
  useUpdateOrderMutation,
  useBookCourierMutation,
  useVerifyPaymentMutation,
} = ordersApi;
