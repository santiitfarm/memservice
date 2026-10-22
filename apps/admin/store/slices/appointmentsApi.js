import { apiSlice } from "../api/apiSlice";

export const appointmentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchAppointments: builder.query({
      query: (params = {}) => {
        const q = new URLSearchParams();
        if (params.doctor) q.set("doctor", params.doctor);
        if (params.status) q.set("status", params.status);
        if (params.search) q.set("search", params.search);
        if (params.from) q.set("from", params.from);
        if (params.to) q.set("to", params.to);
        if (params.page) q.set("page", params.page);
        if (params.limit) q.set("limit", params.limit);
        const qs = q.toString();
        return `/appointments${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["appointments"],
    }),

    fetchSingleAppointment: builder.query({
      query: (id) => `/appointments/${id}`,
      providesTags: (result, error, id) => [{ type: "appointments", id }],
    }),

    updateAppointmentStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["appointments"],
    }),
  }),
});

export const {
  useFetchAppointmentsQuery,
  useFetchSingleAppointmentQuery,
  useUpdateAppointmentStatusMutation,
} = appointmentsApi;
