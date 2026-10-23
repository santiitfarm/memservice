"use client";

import Image from "next/image";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
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
      className="hover:bg-muted/20 transition-colors capitalize text-xs"
    >
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground font-mono">
        {i + 1}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap">
        <Image
          src={category?.categoryImg || "/placeholder.png"}
          width={40}
          height={40}
          alt={category?.categoryName || "Category"}
          className="object-contain bg-muted/40 border border-border h-10 w-10 rounded-lg p-1"
        />
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap font-medium text-foreground">
        <div className="font-semibold text-sm">{category?.categoryName}</div>
        {category?.slug && (
          <span className="text-[11px] text-muted-foreground font-mono">
            /{category.slug}
          </span>
        )}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <EditButton category={category} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
