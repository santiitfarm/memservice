"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillCloseCircle } from "react-icons/ai";
import { BiCloudUpload } from "react-icons/bi";
import { toast } from "react-toastify";
import {
  useAddSliderMutation,
  useUpdateSliderMutation,
} from "../../../../../../store/slices/SliderApi";

const SliderForm = ({ onClose, slider, isEdit }) => {
  const [imagePreview, setImagePreview] = useState(slider?.image || null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [addSlider, { isLoading: isAdding, isSuccess: isAddSuccess, error: addError }] =
    useAddSliderMutation();
  const [updateSlider, { isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError }] =
    useUpdateSliderMutation();

  const isLoading = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: slider?.title || "",
      link: slider?.link || "/shop",
      order: slider?.order ?? 0,
      status: slider?.status || "active",
    },
  });

  useEffect(() => {
    if (slider) {
      setImagePreview(slider.image || null);
      setValue("title", slider.title || "");
      setValue("link", slider.link || "/shop");
      setValue("order", slider.order ?? 0);
      setValue("status", slider.status || "active");
    }
  }, [slider, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    if (!imagePreview && !selectedFile) {
      toast.error("Please upload a banner image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title || "Banner");
    formData.append("link", (data.link || "/shop").trim());
    formData.append("order", String(data.order ?? 0));
    formData.append("status", data.status || "active");

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (slider?.image) {
      formData.append("image", slider.image);
    }

    try {
      if (isEdit && slider?._id) {
        formData.append("id", slider._id);
        const res = await updateSlider(formData).unwrap();
        toast.success(res?.message || "Slider updated successfully");
        onClose();
      } else {
        const res = await addSlider(formData).unwrap();
        toast.success(res?.message || "Slider created successfully");
        onClose();
      }
    } catch (err) {
      console.error("Slider save error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to save slider");
    }
  };

  return (
    <div className="p-6 space-y-5 dark:bg-gray-900 dark:text-gray-200">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Slider Banner" : "Add Slider Banner"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          This image will be displayed on the homepage hero carousel and link to the specified page.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Banner Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Banner Image <span className="text-red-500">*</span>
          </label>

          <label
            htmlFor="slider-image-input"
            className={`relative border-2 border-dashed rounded-xl cursor-pointer w-full h-44 flex flex-col items-center justify-center transition-all overflow-hidden ${
              imagePreview
                ? "border-primary/50 bg-gray-50 dark:bg-gray-800/60"
                : "border-gray-300 dark:border-gray-700 hover:border-primary bg-gray-50/50 dark:bg-gray-800/30"
            }`}
          >
            {imagePreview ? (
              <div className="relative w-full h-full group">
                <Image
                  src={imagePreview}
                  alt="Slider Banner Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs bg-black/60 px-3 py-1.5 rounded-full">
                    Click to change image
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 z-10"
                  title="Remove Image"
                >
                  <AiFillCloseCircle className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <BiCloudUpload className="mx-auto text-4xl text-gray-400 mb-1" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Click or drag image to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended size: 1920x800px (~2.4:1 ratio) • Max 5MB
                </p>
              </div>
            )}
          </label>

          <input
            id="slider-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Redirect Link Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Redirect Link (URL) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("link", { required: "Redirect link is required" })}
            type="text"
            placeholder="e.g. /shop, /offer, /consultation/doctor or /product/slug"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            When a user clicks on this banner, they will be taken to this link.
          </p>
          {errors.link && (
            <span className="text-xs text-red-500 mt-0.5 block">{errors.link.message}</span>
          )}
        </div>

        {/* Title / Alt Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Banner Title / Alt Text <span className="text-xs font-normal text-gray-400">(Optional - for dashboard identification & SEO)</span>
          </label>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Special Healthcare Mega Offer"
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        {/* Order and Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Display Serial (Order)
            </label>
            <input
              {...register("order", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Lower number appears first (e.g. 1, 2, 3)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="active">Active (Visible)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Control visibility on homepage
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEdit ? "Update Slider" : "Upload & Save"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SliderForm;
