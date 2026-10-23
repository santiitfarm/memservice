"use client";

import React, { useState } from "react";
import { Award, Edit2, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function SingeBrand({ brand, i, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const brandId = brand?._id || brand?.id;
  const isActive = brand?.status === "active";

  return (
    <tr
      key={brandId}
      className="hover:bg-muted/20 transition-colors capitalize text-xs"
    >
      {/* Index */}
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground font-mono w-16">
        {i + 1}
      </td>

      {/* Logo */}
      <td className="px-6 py-3.5 whitespace-nowrap w-24">
        {brand?.logo && !imgError ? (
          <img
            src={brand.logo}
            alt={brand?.title || "Brand Logo"}
            onError={() => setImgError(true)}
            className="h-10 w-10 rounded-lg object-contain bg-muted/40 border border-border p-1"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Award className="w-5 h-5" />
          </div>
        )}
      </td>

      {/* Title & Slug */}
      <td className="px-6 py-3.5 whitespace-nowrap font-medium text-foreground">
        <div className="font-semibold text-sm">{brand?.title}</div>
        {brand?.slug && (
          <span className="text-[11px] text-muted-foreground font-mono">
            /{brand.slug}
          </span>
        )}
      </td>

      {/* Display Serial (Order) */}
      <td className="px-6 py-3.5 whitespace-nowrap text-foreground font-mono font-semibold">
        <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/80">
          {brand?.order ?? 0}
        </span>
      </td>

      {/* Linked Category */}
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground">
        {brand?.category?.categoryName || "—"}
      </td>

      {/* Status */}
      <td className="px-6 py-3.5 whitespace-nowrap">
        <Badge variant={isActive ? "success" : "secondary"} className="text-[11px]">
          {brand?.status || "active"}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(brand)}
            className="h-8 px-2.5 text-xs font-medium gap-1"
            title="Edit Brand"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>

          <Button
            variant="ghost-destructive"
            size="icon-sm"
            onClick={() => onDelete?.(brand)}
            title="Delete Brand"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
