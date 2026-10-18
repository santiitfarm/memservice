"use client";

import { login } from "@/app/actions";
import { LockIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DashboardLoginForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await login(formData);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Invalid email or password");
    }
  };

  return (
    <>
      <form
        className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Dashboard Login
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
        >
          <LockIcon
            className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 mr-2"
            aria-hidden="true"
          />
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-center text-gray-500 mt-4">
          Forgot your password?{" "}
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">
            Reset it here
          </Link>
        </p>
      </form>
    </>
  );
};

export default DashboardLoginForm;
