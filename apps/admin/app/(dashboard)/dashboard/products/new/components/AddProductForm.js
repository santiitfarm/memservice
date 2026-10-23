import { useFetchBrandsQuery } from "@/store/slices/brandApi";
import { useAddProductMutation } from "@/store/slices/productApi";
import { Blocks, Loader, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import ImageUpload from "./ImageUpload";
import CodeEditor from "./RichTextEditor";
import { useFetchCategoriesQuery } from "@/store/slices/CategoryApi";
import AutoFillProductForm from "./AutoFillForm";
import VariantsEditor from "../../components/VariantsEditor";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function AddProductForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const { data } = useFetchBrandsQuery();
  const { data: categories } = useFetchCategoriesQuery();
  const [variants, setVariants] = useState([]);
  const [addProduct, { isLoading, isError, isSuccess }] =
    useAddProductMutation();
  const router = useRouter();
  const codeRef = useRef();
  const codeRefBangla = useRef();
  const onSubmit = async (data) => {
    addProduct({
      ...data,
      variants,
      color: data?.color?.split(","),
      tags: data?.tags?.split(","),
      pack_size: data?.pack_size?.split(","),
      product_features: data.product_features?.split("\n") || [],
      specificationsHtml:
        data.specificationsHtml || codeRef.current?.getContent() || "",
      specificationsHtmlBangla:
        data.specificationsHtmlBangla || codeRefBangla.current?.getContent() || "",
    });
  };
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss();
      toast.success("Product added successfully!");
      router.refresh();
      router.push("/dashboard/products");
    }
    if (isError) {
      toast.error("Error adding product");
    }
    if (isLoading) {
      toast.info("Updating product...");
    }
  }, [isSuccess, isError, isLoading]);

  // Watch the value of "isNew"
  const isUsed = watch("isUsed");
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-3 gap-4 w-full mx-auto relative"
    >
      <AutoFillProductForm setValue={setValue} />
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          {...register("name", { required: "Name is required" })}
          type="text"
          id="name"
          placeholder="Antacid"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="manufacturer_name"
          className="block text-sm font-medium text-gray-700"
        >
          Manufacturer Name
        </label>
        <select
          className="mt-1 block w-full border capitalize border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("manufacturer_name", {
            required: "Manufacturer name is required",
          })}
          type="text"
          id="manufacturer_name"
        >
          {data?.brands.map(
            (brand) =>
              brand.title && (
                <option
                  key={brand.id}
                  value={brand.title}
                  className="capitalize dark:bg-gray-900"
                >
                  {brand.title}
                </option>
              )
          )}
        </select>
        {errors.manufacturer_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.manufacturer_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Brand
        </label>
        <select
          className="mt-1 block w-full border capitalize border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("brand", {
            required: "Brand is required",
          })}
        >
          {data?.brands.map(
            (brand) =>
              brand.title && (
                <option
                  key={brand._id}
                  value={brand._id}
                  className="capitalize dark:bg-gray-900"
                >
                  {brand.title}
                </option>
              )
          )}
        </select>
        {errors.brand && (
          <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Category
        </label>
        <select
          className="mt-1 block w-full border capitalize border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("category", {
            required: "Category is required",
          })}
        >
          {categories?.categories.map(
            (category) =>
              category.categoryName && (
                <option
                  key={category._id}
                  value={category._id}
                  className="capitalize dark:bg-gray-900"
                >
                  {category.categoryName}
                </option>
              )
          )}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="products_type"
          className="block text-sm font-medium text-gray-700"
        >
          Product Type
        </label>
        <input
          {...register("products_type", {
            required: "Product type is required",
          })}
          type="text"
          id="products_type"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.products_type && (
          <p className="mt-1 text-sm text-red-600">
            {errors.products_type.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="generic_name"
          className="block text-sm font-medium text-gray-700"
        >
          Generic Name
        </label>
        <input
          {...register("generic_name", {
            required: "Generic name is required",
          })}
          type="text"
          id="generic_name"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.generic_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.generic_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="strength"
          className="block text-sm font-medium text-gray-700"
        >
          Strength
        </label>
        <input
          {...register("strength", { required: "Strength is required" })}
          type="text"
          id="strength"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.strength && (
          <p className="mt-1 text-sm text-red-600">{errors.strength.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pack_size"
          className="block text-sm font-medium text-gray-700"
        >
          Pack Size
        </label>
        <input
          {...register("pack_size", { required: "Pack size is required" })}
          type="text"
          id="pack_size"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.pack_size && (
          <p className="mt-1 text-sm text-red-600">
            {errors.pack_size.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700"
        >
          Color
        </label>
        <input
          {...register("color", { required: "Color is required" })}
          type="text"
          id="color"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="regular_price"
          className="block text-sm font-medium text-gray-700"
        >
          Regular Price
        </label>
        <input
          {...register("regular_price", {
            required: "Regular price is required",
          })}
          type="text"
          id="regular_price"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.regular_price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.regular_price.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="discount_price"
          className="block text-sm font-medium text-gray-700"
        >
          Discount Price
        </label>
        <input
          {...register("discount_price", {
            required: "Discount price is required",
          })}
          type="text"
          id="discount_price"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.discount_price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.discount_price.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="purchase_price"
          className="block text-sm font-medium text-gray-700"
        >
          Purchase Price
        </label>
        <input
          {...register("purchase_price", {
            required: "Purchase price is required",
          })}
          type="text"
          id="purchase_price"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.purchase_price && (
          <p className="mt-1 text-sm text-red-600">
            {errors.purchase_price.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="stock"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Stock
        </label>
        <input
          {...register("stock", { valueAsNumber: true })}
          id="stock"
          type="number"
          defaultValue={1}
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="special_tag"
          className="block text-sm font-medium text-gray-700"
        >
          Special Tag
        </label>
        <input
          {...register("special_tag")}
          type="text"
          id="special_tag"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700"
        >
          Tags
        </label>
        <input
          {...register("tags", { required: "Tags are required" })}
          type="text"
          id="tags"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Images
        </label>
        <Controller
          name="images"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ImageUpload onImagesChange={field.onChange} />
          )}
        />
      </div>
      <div className="col-span-3">
        <label
          htmlFor="short_description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Short Description
        </label>
        <textarea
          {...register("short_description")}
          id="short_description"
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="col-span-2">
        <label
          htmlFor="product_features"
          className="block text-sm font-medium text-gray-700"
        >
          Product Features
        </label>
        <textarea
          {...register("product_features")}
          id="product_features"
          rows={3}
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div className="col-span-2">
        <label
          htmlFor="additional_info"
          className="block text-sm font-medium text-gray-700"
        >
          Additional Info
        </label>
        <textarea
          {...register("additional_info")}
          id="additional_info"
          rows={3}
          className="mt-1 block w-full border border-gray-300 dark:text-gray-200 placeholder:dark:text-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <div className="col-span-3">
        <label
          htmlFor="specificationsHtml"
          className="block text-sm font-semibold text-foreground mb-1.5"
        >
          Description (English)
        </label>
        <Controller
          name="specificationsHtml"
          control={control}
          render={({ field }) => (
            <CodeEditor
              content={field.value}
              onChange={field.onChange}
              ref={codeRef}
              placeholder="Enter comprehensive English medical description, dosage, side effects, precautions..."
            />
          )}
        />
      </div>

      <div className="col-span-3">
        <label
          htmlFor="specificationsHtmlBangla"
          className="block text-sm font-semibold text-foreground mb-1.5"
        >
          Description (Bangla)
        </label>
        <Controller
          name="specificationsHtmlBangla"
          control={control}
          render={({ field }) => (
            <CodeEditor
              content={field.value}
              onChange={field.onChange}
              ref={codeRefBangla}
              placeholder="এখানে বাংলায় বিস্তারিত ঔষধ বিবরণ, ব্যবহারবিধি, মাত্রা ও সতর্কতা লিখুন..."
            />
          )}
        />
      </div>

      <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-muted/20 border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Product Name (Bangla)
          </label>
          <input
            {...register("nameBn")}
            type="text"
            placeholder="যেমন: প্যারাসিটামল ৫০০ মি.গ্রা."
            className="w-full border border-border bg-background text-foreground rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Short Description (Bangla)
          </label>
          <input
            {...register("short_descriptionBn")}
            type="text"
            placeholder="বাংলায় সংক্ষিপ্ত বিবরণ..."
            className="w-full border border-border bg-background text-foreground rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="col-span-3 p-5 bg-card border border-border rounded-xl">
        <VariantsEditor
          variants={variants}
          onChange={(newVars) => {
            setVariants(newVars);
            if (newVars.length > 0) {
              const totalStock = newVars.reduce(
                (s, v) => s + (Number(v.stock) || 0),
                0
              );
              setValue("stock", totalStock);
            }
          }}
        />
      </div>

      <div className="flex items-center justify-end gap-3 col-span-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          className="gap-2"
        >
          <Blocks className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>
    </form>
  );
}
