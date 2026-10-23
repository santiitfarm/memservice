"use client";

import {
  useAddBrandMutation,
  useUpdateBrandMutation,
} from "@/store/slices/brandApi";
import { useFetchCategoriesQuery } from "@/store/slices/CategoryApi";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { BiCloudUpload } from "react-icons/bi";
import { toast } from "react-toastify";

const BrandForm = ({ brand, isEdit, setShowForm }) => {
  const [
    addBrand,
    { isLoading: addLoading, isSuccess: addSuccess, isError: addError },
  ] = useAddBrandMutation();
  const { data: categoryData } = useFetchCategoriesQuery();
  const [
    updateBrand,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
    },
  ] = useUpdateBrandMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: brand?.title || "",
      logo: brand?.logo || null,
      category: brand?.category?._id || brand?.category || "",
      status: brand?.status || "active",
      order: brand?.order ?? 0,
    },
  });

  const [logoPreview, setLogoPreview] = useState(brand?.logo || null);

  useEffect(() => {
    if (addSuccess) {
      toast.success("Brand added successfully!");
      setShowForm();
    } else if (updateSuccess) {
      toast.success("Brand updated successfully!");
      setShowForm();
    }

    if (addError) {
      toast.error(
        `Failed to add brand: ${addError?.data?.message || addError.message || "Unknown error occurred"}`
      );
    } else if (updateError) {
      toast.error(
        `Failed to update brand: ${
          updateError?.data?.message || updateError.message || "Unknown error occurred"
        }`
      );
    }
  }, [addSuccess, updateSuccess, addError, updateError, setShowForm]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("status", data.status);
    formData.append("order", String(data.order ?? 0));
    if (data.category) {
      formData.append("category", data.category);
    }

    if (data.logo && typeof data.logo === "object") {
      if (data.logo.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB.");
        return;
      }
      formData.append("file", data.logo);
    } else if (brand?.logo) {
      formData.append("logo", brand.logo);
    }

    if (isEdit) {
      formData.append("id", brand._id);
      updateBrand(formData);
    } else {
      addBrand(formData);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB.");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    setValue("logo", file);
  };

  const handleRemoveLogo = (e) => {
    e.preventDefault();
    setValue("logo", null);
    setLogoPreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-6 sm:p-8 text-left rounded-xl max-w-lg w-full dark:text-gray-300"
    >
      {/* Title Input */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-bold text-gray-700 dark:text-gray-300"
        >
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Square Toiletries Ltd."
          {...register("title", { required: "Brand name is required" })}
          className="mt-1 h-9 px-3.5 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        {errors.title && (
          <span className="text-red-500 text-xs mt-1 block">{errors.title.message}</span>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label
          htmlFor="logo"
          className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
        >
          Brand Logo Image
        </label>
        <div className="flex items-center justify-center">
          <label
            htmlFor="logo-input"
            className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary px-4 py-3 rounded-xl cursor-pointer w-full h-36 flex items-center justify-center flex-col gap-2 bg-gray-50/50 dark:bg-gray-800/40 transition overflow-hidden"
          >
            {logoPreview ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-h-24 max-w-full object-contain p-2"
                  width={180}
                  height={80}
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition"
                  title="Remove Logo"
                >
                  <AiFillCloseCircle className="text-xl" />
                </button>
              </div>
            ) : (
              <>
                <BiCloudUpload className="text-3xl text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Click or drag brand logo
                </span>
                <span className="text-[11px] text-gray-400">
                  SVG, PNG, JPG or WEBP (Max 5MB)
                </span>
              </>
            )}
          </label>
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </div>

      {/* Row: Order and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="order"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            Display Serial (Order)
          </label>
          <input
            id="order"
            type="number"
            min="0"
            placeholder="1"
            {...register("order", { valueAsNumber: true })}
            className="mt-1 h-9 px-3 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="mt-1 h-9 px-3 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          >
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Optional Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-600 dark:text-gray-400"
        >
          Category (Optional)
        </label>
        <select
          id="category"
          {...register("category")}
          className="mt-1 h-9 px-3 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <option value="">Select Category (Optional)</option>
          {categoryData?.categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={setShowForm}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={addLoading || updateLoading}
          className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition"
        >
          {addLoading || updateLoading ? "Saving..." : isEdit ? "Update Brand" : "Add Brand"}
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
