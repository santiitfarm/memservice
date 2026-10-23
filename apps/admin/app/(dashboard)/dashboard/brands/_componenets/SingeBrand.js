"use client";

import Image from "next/image";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import EditButton from "./EditButton";
import { useDeleteBrandMutation } from "@/store/slices/brandApi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SingeBrand({ brand, i }) {
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const brandId = brand?._id || brand?.id;

  const handleDelete = async () => {
    try {
      const res = await deleteBrand(brandId).unwrap();
      toast.success(res?.message || "Brand deleted successfully");
      setShowConfirm(false);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete brand");
      setShowConfirm(false);
    }
  };

  return (
    <tr
      key={brandId}
      className="dark:hover:bg-gray-800 hover:bg-gray-100 duration-100 capitalize"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {i + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Image
          src={brand?.logo || "/placeholder.png"}
          width={48}
          height={48}
          alt={brand?.title || "Brand Logo"}
          className="h-12 w-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-800"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
        {brand?.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/80 font-mono">
        {brand?.order ?? 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {brand?.category?.categoryName || "—"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            brand?.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {brand?.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <EditButton brand={brand} />
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            title="Delete Brand"
          >
            <AiOutlineDelete className="w-5 h-5" />
          </button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Brand"
          description={`Are you sure you want to delete brand "${brand?.title}"? This cannot be undone if products are linked.`}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          variant="danger"
        />
      </td>
    </tr>
  );
}

