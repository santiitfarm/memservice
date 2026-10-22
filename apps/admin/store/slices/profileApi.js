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

    fetchSessions: builder.query({
      query: () => "/user/sessions",
      providesTags: ["sessions"],
    }),

    revokeSession: builder.mutation({
      query: (jti) => ({
        url: `/user/sessions?jti=${jti}`,
        method: "DELETE",
      }),
      invalidatesTags: ["sessions"],
    }),

    signOutEverywhere: builder.mutation({
      query: () => ({
        url: "/user/sessions?everywhere=true",
        method: "DELETE",
      }),
      invalidatesTags: ["sessions"],
    }),
  }),
});

export const {
  useFetchProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useFetchSessionsQuery,
  useRevokeSessionMutation,
  useSignOutEverywhereMutation,
} = profileApi;
