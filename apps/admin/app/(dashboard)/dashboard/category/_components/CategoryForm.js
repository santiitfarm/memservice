"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from "@/store/slices/CategoryApi";

export default function CategoryForm({
  category = null,
  isEdit = false,
  onClose,
  onSuccess,
  // backwards compatibility for any other callers
  setShowForm,
}) {
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const isSubmitting = isAdding || isUpdating;

  const handleClose = () => {
    if (onClose) onClose();
    else if (setShowForm) setShowForm(false);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryName: category?.categoryName || "",
      categoryNameBn: category?.categoryNameBn || "",
      description: category?.description || "",
      order: category?.order ?? 0,
      status: category?.status || "active",
      featured: category?.featured || false,
      file: null,
    },
  });

  const [logoPreview, setLogoPreview] = useState(category?.categoryImg || null);

  useEffect(() => {
    if (category) {
      setValue("categoryName", category.categoryName || "");
      setValue("categoryNameBn", category.categoryNameBn || "");
      setValue("description", category.description || "");
      setValue("order", category.order ?? 0);
      setValue("status", category.status || "active");
      setValue("featured", Boolean(category.featured));
      setLogoPreview(category.categoryImg || null);
    }
  }, [category, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB.");
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
      formData.append("title", (data.categoryName || "").trim());
      formData.append("categoryName", (data.categoryName || "").trim());
      formData.append("categoryNameBn", (data.categoryNameBn || "").trim());
      formData.append("description", (data.description || "").trim());
      formData.append("order", String(data.order ?? 0));
      formData.append("status", data.status || "active");
      formData.append("featured", String(Boolean(data.featured)));

      if (data.file && typeof data.file === "object") {
        formData.append("file", data.file);
      } else if (isEdit && category?.categoryImg && logoPreview) {
        formData.append("file", category.categoryImg);
      }

      if (isEdit) {
        formData.append("id", category._id || category.id);
        const res = await updateCategory(formData).unwrap();
        toast.success(res?.message || "Category updated successfully!");
      } else {
        const res = await addCategory(formData).unwrap();
        toast.success(res?.message || "Category created successfully!");
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
      {/* Category Names: English & Bangla */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category Name (English) <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Medical Devices"
            {...register("categoryName", {
              required: "Category name in English is required",
            })}
            className={`w-full px-3 py-2 text-xs bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${
              errors.categoryName ? "border-destructive" : "border-border"
            }`}
          />
          {errors.categoryName && (
            <p className="text-[11px] text-destructive mt-1">
              {errors.categoryName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Category Name (Bangla)
          </label>
          <input
            type="text"
            placeholder="যেমন: মেডিকেল ডিভাইস"
            {...register("categoryNameBn")}
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
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
            <option value="active">Active (Visible in Catalog)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Featured checkbox */}
      <div className="flex items-center gap-2 p-3 rounded-lg border border-border/80 bg-muted/20">
        <input
          id="featured"
          type="checkbox"
          {...register("featured")}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
        />
        <label htmlFor="featured" className="text-xs font-medium text-foreground cursor-pointer">
          Feature this category on the homepage category slider
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="Brief summary of medicines or products under this category..."
          {...register("description")}
          className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
        />
      </div>

      {/* Category Image Upload */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Category Icon / Image
        </label>
        <div className="flex items-center justify-center">
          <label
            htmlFor="category-image-input"
            className="relative border-2 border-dashed border-border hover:border-primary/60 px-4 py-4 rounded-xl cursor-pointer w-full h-36 flex items-center justify-center flex-col gap-2 bg-muted/20 hover:bg-muted/30 transition overflow-hidden group"
          >
            {logoPreview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Standard img tag prevents Next.js blob/data-url crash */}
                <img
                  src={logoPreview}
                  alt="Category Preview"
                  className="max-h-24 max-w-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-md transition"
                  title="Remove Image"
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
                  Click or drag image to upload
                </span>
                <span className="text-[11px] text-muted-foreground">
                  SVG, PNG, JPG or WEBP (Max 2MB)
                </span>
              </div>
            )}
          </label>
          <input
            id="category-image-input"
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
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
