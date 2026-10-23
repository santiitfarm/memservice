"use client";

import Image from "next/image";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
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

  const isActive = brand?.status === "active";

  return (
    <tr
      key={brandId}
      className="hover:bg-muted/20 transition-colors capitalize text-xs"
    >
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground font-mono">
        {i + 1}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap">
        <Image
          src={brand?.logo || "/placeholder.png"}
          width={40}
          height={40}
          alt={brand?.title || "Brand Logo"}
          className="h-10 w-10 rounded-lg object-contain bg-muted/40 border border-border p-1"
        />
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap font-medium text-foreground">
        <div className="font-semibold text-sm">{brand?.title}</div>
        {brand?.slug && (
          <span className="text-[11px] text-muted-foreground font-mono">
            /{brand.slug}
          </span>
        )}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap text-foreground font-mono font-semibold">
        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/80">
          {brand?.order ?? 0}
        </span>
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground">
        {brand?.category?.categoryName || "—"}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap">
        <Badge variant={isActive ? "success" : "secondary"} className="text-[11px]">
          {brand?.status || "active"}
        </Badge>
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <EditButton brand={brand} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title="Delete Brand"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
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
