"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import loginImage from "../../../assets/loginImg.svg";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "../_components/ResetPasswordModal";

const inputFieldContainerStyle =
  "relative w-full flex font-medium flex-col gap-2 overflow-hidden text-deep-sea-blue";
const inputFieldStyle =
  "w-full py-4 px-5 rounded border border-gray-300 focus:border-sky-blue transition-all duration-300 text-sm outline-none";

function Login() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const router = useRouter();
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
    const result = await signIn("credentials", {
      redirect: false, // Prevent automatic redirect by NextAuth
      phone: formData.phone,
      password: formData.password,
    });

    if (!result?.error) {
      setIsLoading(false);
      // Redirect to the desired route
      router.push("/account"); // Change this to your desired route
    } else {
      setIsLoading(false);

      setError({
        status: true,
        message: "Invalid phone number or password",
      });
      console.error("Login failed:", result);
      // Show error message or handle failure
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

export default Login;
