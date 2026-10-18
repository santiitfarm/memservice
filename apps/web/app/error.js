"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalErrorPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="w-24 h-24 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-sky-blue">
          Oops! Something went wrong
        </h1>
        <p className="text-deep-sea-blue">
          We are sorry, but an unexpected error has occurred. Please try again
          later.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-sky-blue text-white rounded-md transition-colors"
          >
            Reload Page
          </button>
          <Link
            href="/"
            className="w-full px-4 py-2 block text-center border border-sunset-orange text-deep-sea-blue rounded-md hover:bg-blue-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
