"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, X, Award, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import {
  useAddBrandMutation,
  useUpdateBrandMutation,
} from "@/store/slices/brandApi";
import { useFetchCategoriesQuery } from "@/store/slices/CategoryApi";

export default function BrandForm({
  brand = null,
  isEdit = false,
  onClose,
  onSuccess,
  // backwards compatibility
  setShowForm,
}) {
  const [addBrand, { isLoading: isAdding }] = useAddBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const { data: categoryData } = useFetchCategoriesQuery();
  const categories = categoryData?.categories || [];

  const isSubmitting = isAdding || isUpdating;

  const handleClose = () => {
    if (onClose) onClose();
    else if (setShowForm) setShowForm(false);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: brand?.title || "",
      category: brand?.category?._id || brand?.category || "",
      status: brand?.status || "active",
      order: brand?.order ?? 0,
      file: null,
    },
  });

  const [logoPreview, setLogoPreview] = useState(brand?.logo || null);

  useEffect(() => {
    if (brand) {
      setValue("title", brand.title || "");
      setValue("category", brand.category?._id || brand.category || "");
      setValue("status", brand.status || "active");
      setValue("order", brand.order ?? 0);
      setLogoPreview(brand.logo || null);
    } else {
      setValue("title", "");
      setValue("category", "");
      setValue("status", "active");
      setValue("order", 0);
      setValue("file", null);
      setLogoPreview(null);
    }
  }, [brand, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Brand logo size must be less than 5MB.");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setValue("file", file);
    } catch {
      toast.error("Failed to read selected image.");
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("file", null);
    setLogoPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", (data.title || "").trim());
      formData.append("status", data.status || "active");
      formData.append("order", String(data.order ?? 0));
      if (data.category) {
        formData.append("category", data.category);
      }

      if (data.file && typeof data.file === "object") {
        formData.append("file", data.file);
      } else if (isEdit && brand?.logo && logoPreview) {
        formData.append("logo", brand.logo);
      }

      if (isEdit) {
        formData.append("id", brand._id || brand.id);
        const res = await updateBrand(formData).unwrap();
        toast.success(res?.message || "Brand updated successfully!");
      } else {
        const res = await addBrand(formData).unwrap();
        toast.success(res?.message || "Brand created successfully!");
      }

      if (onSuccess) onSuccess();
      else handleClose();
    } catch (err) {
      const errMsg =
        err?.data?.message || err?.data?.error || err?.message || "Something went wrong";
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Brand Name */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Brand Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Square Pharmaceuticals Ltd."
          {...register("title", { required: "Brand name is required" })}
          className={`w-full px-3 py-2 text-xs bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${
            errors.title ? "border-destructive" : "border-border"
          }`}
        />
        {errors.title && (
          <p className="text-[11px] text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Row: Display Serial (Order) and Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Display Serial (Order)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            {...register("order", { valueAsNumber: true })}
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Catalog Status
          </label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="active">Active (Visible)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Linked Category (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Associated Category (Optional)
        </label>
        <select
          {...register("category")}
          className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        >
          <option value="">Select Category (Optional)</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Logo Upload */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Brand Official Logo
        </label>
        <div className="flex items-center justify-center">
          <label
            htmlFor="brand-logo-input"
            className="relative border-2 border-dashed border-border hover:border-primary/60 px-4 py-4 rounded-xl cursor-pointer w-full h-36 flex items-center justify-center flex-col gap-2 bg-muted/20 hover:bg-muted/30 transition overflow-hidden group"
          >
            {logoPreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={logoPreview}
                  alt="Brand Logo Preview"
                  className="max-h-24 max-w-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-md transition"
                  title="Remove Logo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  Click or drag brand logo to upload
                </span>
                <span className="text-[11px] text-muted-foreground">
                  SVG, PNG, JPG or WEBP (Max 5MB)
                </span>
              </div>
            )}
          </label>
          <input
            id="brand-logo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEdit
            ? "Update Brand"
            : "Create Brand"}
        </Button>
      </div>
    </form>
  );
}
