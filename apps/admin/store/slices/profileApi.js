import { apiSlice } from "../api/apiSlice";

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchProfile: builder.query({
      query: () => "/user/profile",
      providesTags: ["profile"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/user/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["profile"],
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: "/user/security",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useFetchProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApi;
