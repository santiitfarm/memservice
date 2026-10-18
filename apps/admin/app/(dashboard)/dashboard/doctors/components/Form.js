"use client";

import { Controller, useForm } from "react-hook-form";
import ImageUpload from "../../products/new/components/ImageUpload";
import Field from "./Field";
import { Loader } from "lucide-react";
import { Blocks } from "lucide-react";
import { ShieldX } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AutoFill from "./AutoFill";
import { set } from "mongoose";
import { RefreshCcw } from "lucide-react";
import { useFetchDocCategoriesQuery } from "@/store/slices/docCategoriesApi";
import { useAddDoctorMutation } from "@/store/slices/doctorApi";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Form = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useFetchDocCategoriesQuery();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
    setError,
  } = useForm();
  const router = useRouter();
  const [
    addDoctor,
    { isLoading: isAdding, error, isError, isSuccess, data: doc },
  ] = useAddDoctorMutation();
  const submitForm = (formData) => {
    addDoctor({
      ...formData,
      image: formData.image[0],
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Doctor added successfully.");
      reset();
      router.push(`/dashboard/doctors/${doc._id}`);
    }
    if (isError) {
      toast.error(error.data.message);
    }
  }, [isSuccess, isError]);

  return (
    <div className="relative">
      <AutoFill setValue={setValue} classStyle="absolute -top-10 right-0" />
      <form
        onSubmit={handleSubmit(submitForm)}
        className="grid grid-cols-3 gap-4 w-full mx-auto relative"
      >
        <Field label="Name" htmlFor={"name"} error={errors.name}>
          <input
            {...register("name", { required: "Name is required." })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.name ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="name"
            id="name"
            placeholder="e.g. Dr. John Smith"
          />
        </Field>

        <Field label="Degree" htmlFor={"degree"} error={errors.degree}>
          <input
            {...register("degree", { required: "Degree is required." })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.degree ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="degree"
            id="degree"
            placeholder="e.g. MBBS, MD (Cardiology)"
          />
        </Field>

        <Field
          label="Contract number"
          htmlFor={"contract_number"}
          error={errors.contract_number}
        >
          <input
            {...register("contract_number", {
              required: "Contract number is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.degree ? "border-red-500" : "border-gray-200"
            }`}
            type="number"
            name="contract_number"
            id="contract_number"
            placeholder="e.g. 1234567890"
          />
        </Field>

        <Field
          label="Available day"
          htmlFor={"available_day"}
          error={errors.available_day}
        >
          <input
            {...register("available_day", {
              required: "Available day is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.degree ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="available_day"
            id="available_day"
            placeholder="e.g. Sat - Fri (05:30 AM-11:55 PM)"
          />
        </Field>

        <Field
          label="Department"
          htmlFor={"department"}
          error={errors.department}
        >
          <select
            {...register("department", { required: "Department is required." })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.department ? "border-red-500" : "border-gray-200"
            }`}
            name="department"
            id="department"
          >
            <option value="" selected>
              Select a department
            </option>
            {data?.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Specialty" htmlFor={"specialty"} error={errors.specialty}>
          <input
            {...register("specialty", { required: "Specialty is required." })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.specialty ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="specialty"
            id="specialty"
            placeholder="e.g. Interventional Cardiology"
          />
        </Field>

        <Field
          label="Experience"
          htmlFor={"experience"}
          error={errors.experience}
        >
          <input
            {...register("experience", { required: "Experience is required." })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.experience ? "border-red-500" : "border-gray-200"
            }`}
            type="number"
            name="experience"
            id="experience"
            placeholder="e.g. 5"
          />
        </Field>

        <Field
          label="Hospital Name"
          htmlFor={"hospital_name"}
          error={errors.hospital_name}
        >
          <input
            {...register("hospital_name", {
              required: "Hospital Name is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.hospital_name ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="hospital_name"
            id="hospital_name"
            placeholder="e.g. City Medical Center"
          />
        </Field>

        <Field
          label="BMDC Number"
          htmlFor={"bmdc_number"}
          error={errors.bmdc_number}
        >
          <input
            {...register("bmdc_number", {
              required: "BMDC Number is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.bmdc_number ? "border-red-500" : "border-gray-200"
            }`}
            type="number"
            name="bmdc_number"
            id="bmdc_number"
            placeholder="e.g. 123456"
          />
        </Field>

        <Field
          label="Consultation fee"
          htmlFor={"consultation_fee"}
          error={errors.consultation_fee}
        >
          <input
            {...register("consultation_fee", {
              required: "Consultation fee is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.consultation_fee ? "border-red-500" : "border-gray-200"
            }`}
            type="number"
            name="consultation_fee"
            id="consultation_fee"
            placeholder="e.g. 1000"
          />
        </Field>

        <Field
          label="Follow-up fee"
          htmlFor={"follow_up_fee"}
          error={errors.follow_up_fee}
        >
          <input
            {...register("follow_up_fee", {
              required: "Follow-up fee is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.follow_up_fee ? "border-red-500" : "border-gray-200"
            }`}
            type="number"
            name="follow_up_fee"
            id="follow_up_fee"
            placeholder="e.g. 500"
          />
        </Field>

        <Field
          label="Doctor code"
          htmlFor={"doctor_code"}
          error={errors.doctor_code}
        >
          <input
            {...register("doctor_code", {
              required: "Doctor code is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.doctor_code ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="doctor_code"
            placeholder="e.g. DOC-2023-001"
          />
        </Field>

        <Field
          label="Doctor Info"
          htmlFor={"doctor_info"}
          error={errors.doctor_info}
        >
          <textarea
            {...register("doctor_info", {
              required: "Doctor Info is required.",
            })}
            className={`mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              !!errors.doctor_info ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            name="doctor_info"
            id="doctor_info"
            placeholder="Enter detailed information about your qualifications, expertise, and special interests in medical practice"
          />
        </Field>

        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Images
          </label>
          <Controller
            name="image"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <ImageUpload onImagesChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex gap-4 col-span-3 justify-center items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="w-36 flex justify-center gap-1 items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" /> adding ...
              </>
            ) : (
              <>
                <Blocks /> Add Doctor
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            className="w-36 bg-gray-500 p-2 rounded-md text-white flex justify-center items-center gap-1 font-semibold"
          >
            <RefreshCcw /> Reset
          </button>

          <button
            type="button"
            onClick={router.back}
            className="w-36 flex justify-center items-center gap-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ShieldX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
