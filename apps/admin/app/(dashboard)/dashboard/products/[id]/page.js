"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

import { useRef } from "react";
import { toast } from "react-toastify";

import {
  useDeleteProductMutation,
  useFetchSingleProductsQuery,
  useUpdateProductMutation,
} from "@/store/slices/productApi";
import CodeEditor from "../new/components/RichTextEditor";
import { useEffect } from "react";
import BackButton from "../../components/ui/BackButton";

import ProductDetailsSkeleton from "../new/components/SingleProductLoader";
import { Tag } from "lucide-react";
import { Delete } from "lucide-react";
import DeleteConfirmationModal from "../../banners/_components/DeleteModal";
import ImageUpload from "../new/components/ImageUpload";
import VariantsEditor from "../components/VariantsEditor";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isSuccess, refetch } =
    useFetchSingleProductsQuery(id);
  const [
    updateProduct,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
    },
  ] = useUpdateProductMutation();
  const codeRef = useRef();
  const codeRefBangla = useRef();
  const [deleteProduct] = useDeleteProductMutation();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [isOpenModal, setIsOpenModal] = useState();
  const [lang, setLang] = useState("en");
  useEffect(() => {
    isSuccess && setEditedProduct(data?.product);
  }, [isSuccess, data]);
  const handleInputChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const processField = (field, delimiter = ",") => {
      if (Array.isArray(field)) {
        return field;
      }
      return typeof field === "string" ? field.split(delimiter) : [];
    };

    console.log("editedProduct", editedProduct);
    updateProduct({
      ...editedProduct,
      color: processField(editedProduct?.color, ","),
      tags: processField(editedProduct?.tags, ","),
      pack_size: processField(editedProduct?.pack_size, ","),
      product_features: processField(editedProduct?.product_features, "\n"),
      specificationsHtml: codeRef?.current?.getContent(),
      specificationsHtmlBangla: codeRefBangla?.current?.getContent(),
    });
  };

  const onImagesChange = (link) => {
    setEditedProduct((prev) => {
      return { ...prev, images: link };
    });
  };
  useEffect(() => {
    if (updateSuccess) {
      toast.success("Product updated successfully");
      setIsEditMode(false);
      refetch();
    }
    if (updateError) {
      toast.error("Error updating product");
    }
    if (updateLoading) {
      toast.info("Updating product...");
    }
  }, [updateError, updateSuccess, updateLoading]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  const renderField = (label, field, type = "text") => {
    return (
      <div>
        <p className="text-gray-600 capitalize">{label}</p>
        {isEditMode ? (
          <input
            type={type}
            value={editedProduct[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:text-gray-500"
          />
        ) : (
          <p className="font-medium dark:text-gray-500">
            {Array.isArray(editedProduct[field])
              ? editedProduct[field].join(", ")
              : editedProduct[field]}
          </p>
        )}
      </div>
    );
  };
  const renderTextArea = (label, field) => {
    return (
      <>
        <p className="text-gray-600 capitalize">{label}</p>
        {isEditMode ? (
          <textarea
            value={editedProduct[field].join("\n")}
            rows={4}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:text-gray-500"
          />
        ) : (
          <p className="font-medium dark:text-gray-500">
            {Array.isArray(editedProduct[field])
              ? editedProduct[field].join(", ")
              : editedProduct[field]}
          </p>
        )}
      </>
    );
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6 sticky top-0 py-10 bg-white dark:bg-gray-900 z-10 pl-4">
        {isEditMode ? (
          <input
            type="text"
            value={editedProduct.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="text-3xl font-bold text-gray-900 dark:text-gray-400 border rounded p-1"
          />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-400">
            {editedProduct.name}{" "}
            <div
              className={
                "inline-flex items-center gap-1 px-2 py-1 text-xs capitalize font-semibold text-yellow-800 bg-yellow-100 rounded-full shadow-sm"
              }
            >
              <Tag className="w-3 h-3" />
              <span>
                {editedProduct?.special_tag ? editedProduct?.special_tag : ""}
              </span>
            </div>
          </h1>
        )}

        <div className="flex gap-2 items-center">
          <div className="bg-green-400 font-black text-gray-600 px-4 py-2 rounded-md hover:bg-green-500 transition-colors flex items-center gap-2">
            Total Sold Out:
            <strong className="">{editedProduct.sold_out}</strong>
          </div>
          {isEditMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditedProduct(data?.product);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsOpenModal(true)}
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Delete /> Delete Product
              </button>
              {isOpenModal && (
                <DeleteConfirmationModal
                  item={editedProduct}
                  onClose={() => setIsOpenModal(false)}
                  onDelete={() => {
                    deleteProduct(editedProduct._id);
                    router.push("/dashboard/products");
                  }}
                  type={"Product"}
                />
              )}
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          {isEditMode ? (
            <ImageUpload
              onImagesChange={onImagesChange}
              images={editedProduct.images}
            />
          ) : (
            <div className="border rounded-lg overflow-hidden mb-4 p-2">
              {editedProduct.images && editedProduct.images.length > 0 ? (
                <Image
                  src={editedProduct.images[activeImageIndex]}
                  alt={editedProduct.name}
                  width={600}
                  height={600}
                  className="w-full h-96 object-contain"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  No Image Available
                </div>
              )}
            </div>
          )}

          {!isEditMode &&
            editedProduct.images &&
            editedProduct.images.length > 1 && (
              <div className="flex space-x-2">
                {editedProduct.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-16 h-16 border rounded-lg overflow-hidden ${
                      index === activeImageIndex ? "border-blue-500" : ""
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

          <div className="mt-8 bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4  dark:text-gray-400">
              Product Status
            </h3>
            {[
              "is_new",
              "is_trending",
              "is_offer",
              "top_seller",
              "best_seller",
            ].map((status) => (
              <label key={status} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editedProduct[status]}
                  onChange={(e) => handleInputChange(status, e.target.checked)}
                  disabled={!isEditMode}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {status
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              {renderField("Purchase Price", "purchase_price", "number")}
              {renderField("Regular Price", "regular_price", "number")}
              {renderField("Discount Price", "discount_price", "number")}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {renderField("generic name", "generic_name")}
                {renderField("Manufacturer name", "manufacturer_name")}
                {renderField("products type", "products_type")}
                {renderField("strength", "strength")}
                {renderField("Stock", "stock", "number")}
                {renderField("pack size", "pack_size")}
                {renderField("color", "color")}
                {renderField("special_tag", "special_tag")}
                {renderField("tags", "tags")}
              </div>

              {/* Continue with other fields similarly */}
              {renderField("Short Description", "short_description")}
              {renderField("Product Name (Bangla)", "nameBn")}
              {renderField("Short Description (Bangla)", "short_descriptionBn")}
              {renderField("additional_info", "additional_info")}
              {renderTextArea("product_features", "product_features")}

              {/* Variants Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <VariantsEditor
                  variants={editedProduct?.variants || []}
                  onChange={(newVariants) => {
                    handleInputChange("variants", newVariants);
                    if (newVariants.length > 0) {
                      const totalVarStock = newVariants.reduce(
                        (sum, v) => sum + (Number(v.stock) || 0),
                        0
                      );
                      handleInputChange("stock", totalVarStock);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-8 bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4  dark:text-gray-400 flex justify-between">
          Detailed Specifications{" "}
          <span className="flex gap-2 text-sm ">
            <button
              className={`p-1 border px-2 ${
                lang === "en" && "bg-blue-500 text-white"
              }`}
              onClick={() => setLang("en")}
            >
              English
            </button>
            <button
              className={`p-1 border px-2 ${
                lang === "bn" && "bg-blue-500 text-white"
              }`}
              onClick={() => setLang("bn")}
            >
              বাংলা
            </button>
          </span>
        </h3>
        {isEditMode ? (
          <>
            <CodeEditor
              ref={codeRef}
              content={editedProduct.specificationsHtml}
            />
            <CodeEditor
              ref={codeRefBangla}
              content={editedProduct.specificationsHtmlBangla}
            />
          </>
        ) : (
          <>
            <div
              className="prose max-w-none text-gray-500 dark:text-gray-400"
              dangerouslySetInnerHTML={{
                __html:
                  lang === "en"
                    ? editedProduct.specificationsHtml
                    : editedProduct.specificationsHtmlBangla,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
