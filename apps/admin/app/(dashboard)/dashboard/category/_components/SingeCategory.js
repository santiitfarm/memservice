"use client";

import Image from "next/image";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import EditButton from "./EditButton";
import { useDeleteCategoryMutation } from "@/store/slices/CategoryApi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SingeCategory({ category, i }) {
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const res = await deleteCategory(category._id).unwrap();
      toast.success(res?.message || "Category deleted successfully");
      setShowConfirm(false);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete category");
      setShowConfirm(false);
    }
  };

  return (
    <tr
      key={category?._id}
      className="dark:hover:bg-gray-800 hover:bg-gray-100 duration-100 capitalize"
    >
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
        {i + 1}
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
        <Image
          src={category?.categoryImg || "/placeholder.png"}
          width={48}
          height={48}
          alt={category?.categoryName || "Category"}
          className="object-contain bg-gray-100 dark:bg-gray-800 h-12 w-12 rounded-lg"
        />
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-foreground">
        <div>{category?.categoryName}</div>
        {category?.slug && (
          <span className="text-xs text-muted-foreground font-mono">
            /{category.slug}
          </span>
        )}
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <EditButton category={category} />
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            title="Delete Category"
          >
            <AiOutlineDelete className="w-5 h-5" />
          </button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Category"
          description={`Are you sure you want to delete "${category?.categoryName}"? This action cannot be undone if products are linked.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          variant="danger"
        />
      </td>
    </tr>
  );
}

