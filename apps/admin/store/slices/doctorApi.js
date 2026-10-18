import { apiSlice } from "../api/apiSlice";

export const doctorsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchdoctors: builder.query({
      query: () => "/doctors",
      providesTags: ["doctors"],
    }),
    fetchdoctorById: builder.query({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: "GET",
        providesTags: ["doctors"],
      }),
    }),
    addDoctor: builder.mutation({
      query: (user) => ({
        url: "/doctors",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["doctors"],
    }),

    updateDoctor: builder.mutation({
      query: (user) => ({
        url: `/doctors`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["doctors"],
    }),
  }),
});

export const {
  useFetchdoctorsQuery,
  useAddDoctorMutation,
  useUpdateDoctorMutation,
  useFetchdoctorByIdQuery,
} = doctorsApi;
