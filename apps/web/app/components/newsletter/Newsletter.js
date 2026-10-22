"use client";

import { useState } from "react";
import { BsSend } from "react-icons/bs";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    const address = email.trim();
    if (!address) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Submission failed");

      setEmail("");
      toast.success("Thank you for subscribing to the Mem Service newsletter!");
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 md:px-6 py-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 text-white">
      <div className="max-w-xl text-center lg:text-left">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          Subscribe to our Healthcare Newsletter
        </h3>
        <p className="text-xs sm:text-sm text-white/90 mt-2 leading-relaxed">
          Get exclusive discounts, new arrival alerts, and certified health tips delivered straight to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="relative w-full max-w-md">
        <input
          className="w-full h-12 rounded-full pl-5 pr-32 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 shadow-md text-xs sm:text-sm"
          type="email"
          placeholder="Enter your email address..."
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute top-1 right-1 bottom-1 px-4 sm:px-6 rounded-full bg-sunset-orange hover:bg-sunset-orange/90 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <BsSend />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
