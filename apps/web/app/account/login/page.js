"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import loginImage from "../../../assets/loginImg.svg";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ResetPasswordModal from "../_components/ResetPasswordModal";

const inputFieldContainerStyle =
  "relative w-full flex font-medium flex-col gap-2 overflow-hidden text-deep-sea-blue";
const inputFieldStyle =
  "w-full py-4 px-5 rounded border border-gray-300 focus:border-sky-blue transition-all duration-300 text-sm outline-none";

function LoginForm() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState({
    status: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setError({ status: false, message: "" });
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ status: false, message: "" });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const checkRes = await fetch(`${apiUrl}/api/customerProfile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      });

      const checkData = await checkRes.json().catch(() => ({}));

      if (!checkRes.ok) {
        setIsLoading(false);
        setError({
          status: true,
          message:
            checkData.error ||
            "Invalid phone number or password. Please try again.",
        });
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setIsLoading(false);
      if (!result?.error) {
        router.push("/account");
      } else {
        setError({
          status: true,
          message: "Unable to sign in. Please verify your credentials.",
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError({
        status: true,
        message: "Network error occurred. Please try again.",
      });
    }
  };

  return (
    <section className="flex flex-col xl:flex-row items-center container w-full mx-auto px-2.5 md:px-6 gap-6 mt-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-[700px] w-full mx-auto p-3 md:p-6 flex flex-col gap-6 shadow-md border border-custom-border rounded-lg"
      >
        <div className="text-center">
          <h1 className="text-2xl text-deep-sea-blue font-semibold capitalize">
            Welcome back.
          </h1>
          <p className="capitalize text-base text-fresh-green font-medium mt-1">
            Please Login using account details below.
          </p>
        </div>

        {registered && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm text-center font-medium">
            Account created successfully! Please sign in with your phone number and password.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className={inputFieldContainerStyle}>
            <label htmlFor="phone">Phone Number</label>
            <input
              className={inputFieldStyle}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Please Enter Your Number"
              required
            />
          </div>
          <div className={inputFieldContainerStyle}>
            <label htmlFor="password">Password</label>
            <input
              className={inputFieldStyle}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Please Enter Your Password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-5 bg-deep-sea-blue text-white rounded-lg font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Logging.." : "Sign In"}
        </button>
        {error.status && (
          <p className="text-red-500 p-1 capitalize text-center bg-rose-100 rounded-md">
            {error.message}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <p className="font-medium">Don’t have an account?</p>
            <Link
              className="text-custom-accent text-sky-blue font-semibold"
              href="/account/register"
            >
              Register now
            </Link>
          </div>

          <button
            type="button"
            className="pr-2 underline text-fresh-green"
            onClick={() => setIsModalOpen(true)}
          >
            Forgot Password
          </button>
          <ResetPasswordModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </form>

      <div className="max-w-[520px] hidden xl:block">
        <Image
          className="w-full h-full"
          src={loginImage}
          alt="Register Illustration"
        />
      </div>
    </section>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm text-gray-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
