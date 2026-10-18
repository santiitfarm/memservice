"use client";
// import react icon
import { useState } from "react";
import { BsSend } from "react-icons/bs";
import { toast } from "react-toastify";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const address = email.trim();
    if (!address) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: address }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Submission failed");

      setEmail("");
      toast.success("Thanks for Subscribing Mem Service!");
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="container mx-auto px-4 md:px-6 flex gap-4 flex-col lg:flex-row items-start justify-between text-white p-8">
      <div>
        <h4 className="text-2xl font-bold leading-7">Join our newsletter</h4>
        <p className="text-sm leading-6 mt-2">
          Join over half a million vitamin lovers and get our latest deals,
          articles, and resources!
        </p>
      </div>
      <div className="relative w-full lg:w-10/12 xl:w-1/2 overflow-hidden">
        <input
          className="relative w-full h-12 rounded-full px-5 bg-light-mist text-deep-sea-blue focus:outline-none"
          type="email"
          placeholder="Email address.."
          name="EmailAddress"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="w-32 sm:w-36 xl:w-48 h-full absolute top-0 right-0 rounded-r-full bg-sunset-orange transition-all duration-300 hover:bg-deep-sea-blue flex items-center justify-center cursor-pointer">
          <button
            className="flex items-center gap-3 text-sm sm:text-base font-medium sm:font-semibold"
            onClick={handleSubscribe}
            disabled={loading}
          >
            <span className="text-lg sm:text-xl">
              <BsSend />
            </span>
            <span>Subscribe</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
