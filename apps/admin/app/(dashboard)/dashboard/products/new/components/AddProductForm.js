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
  //console.log(data);
  const [addProduct, { isLoading, isError, isSuccess }] =
    useAddProductMutation();
  const router = useRouter();
  const codeRef = useRef();
  const codeRefBangla = useRef();
  const onSubmit = async (data) => {
    addProduct({
      ...data,
      color: data?.color?.split(","),
      tags: data?.tags?.split(","),
      pack_size: data?.pack_size?.split(","),
      product_features: data.product_features.split("\n"),
      specificationsHtml: codeRef.current.getContent(),
      specificationsHtmlBangla: codeRefBangla.current.getContent(),
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
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Description (English)
        </label>
        <Controller
          name="specificationsHtml"
          control={control}
          render={({ field }) => (
            // <RichTextEditor content={field.value} onChange={field.onChange} />
            <CodeEditor content={field.value} ref={codeRef} />
          )}
        />
      </div>
      <div className="col-span-3">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-400"
        >
          Description (Bangla)
        </label>
        <Controller
          name="specificationsHtmlBangla"
          control={control}
          render={({ field }) => (
            // <RichTextEditor content={field.value} onChange={field.onChange} />
            <CodeEditor content={field.value} ref={codeRefBangla} />
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
              <Blocks /> Add Product
            </>
          )}
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
  );
}
