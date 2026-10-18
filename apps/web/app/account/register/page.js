"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import registerImage from "../../../assets/register.jpg";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const inputFieldContainerStyle =
  "relative w-full flex font-medium flex-col gap-2 overflow-hidden";
const inputFieldStyle =
  "w-full py-4 px-5 rounded border border-gray-300 focus:border-sky-blue transition-all duration-300 text-sm outline-none";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customerProfile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Convert the data to JSON
        }
      );

      if (!res.ok) {
        // Handle non-successful responses
        const errorData = await res.json();
        console.error("Error:", errorData);
        toast.error(
          `Failed to register: ${errorData.message || "Unknown error"}`
        );
        return;
      }

      const data = await res.json();

      toast.success("Registration successful!"); // Notify the user
      router.push("/account/login");
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <section className="flex flex-col-reverse xl:flex-row items-center container w-full mx-auto px-2.5 md:px-6 gap-6">
      <div className="max-w-[700px] hidden xl:block">
        <Image
          className="w-full h-full"
          src={registerImage}
          alt="Register Illustration"
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="max-w-[700px] w-full mx-auto p-3 md:p-6 flex flex-col gap-6 shadow-md border border-gray-300 rounded-lg mt-6"
      >
        <div className="text-center">
          <h1 className="text-2xl text-deep-sea-blue font-semibold capitalize">
            Let&#39;s join us.
          </h1>
          <p className="capitalize text-base text-fresh-green font-medium mt-1">
            Please register using account details below.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {["name", "phone", "password", "confirmPassword"].map(
            (field, idx) => (
              <div className={inputFieldContainerStyle} key={idx}>
                <label className="text-deep-sea-blue" htmlFor={field}>
                  {field === "confirmPassword"
                    ? "Confirm Password"
                    : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  className={inputFieldStyle}
                  type={
                    field.toLowerCase().includes("password")
                      ? "password"
                      : "text"
                  }
                  id={field}
                  name={field}
                  placeholder={`Please Enter Your ${field}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-5 bg-deep-sea-blue text-white rounded-lg font-semibold"
        >
          Register Now
        </button>

        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <p className="font-medium">Have an account?</p>
            <Link className="text-sky-blue font-semibold" href="/account/login">
              Login Now
            </Link>
          </div>

          {/* <div className="flex gap-2 items-center">
            <p className="text-blue-500 font-semibold text-nowrap">
              or sign up using
            </p>
            <button
              type="button"
              className="bg-gray-100 p-3 rounded-lg"
              onClick={() => alert("Google Sign-Up Coming Soon!")}
            >
              <FcGoogle />
            </button>
          </div> */}
        </div>
      </form>
    </section>
  );
}

export default Register;
