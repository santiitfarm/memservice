/* eslint-disable no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_APP_URL_DEV}/api`,
    // The API authenticates staff via the shared session cookie.
    credentials: "include",
  }),

  tagTypes: [
    "stocks",
    "stock",
    "products",
    "product",
    "customers",
    "customer",
    "orders",
    "order",
    "users",
    "user",
    "customerProfiles",
    "categories",
    "category",
    "brands",
    "brand",
    "doctors",
    "doccategories",
  ],

  endpoints: (builder) => ({}),
});
