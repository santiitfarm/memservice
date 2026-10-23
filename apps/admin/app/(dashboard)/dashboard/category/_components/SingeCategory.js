"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Layers, CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function SingeCategory({ category, i, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const isActive = category?.status !== "inactive";

  return (
    <tr className="hover:bg-muted/20 transition-colors text-xs">
      {/* Index */}
      <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground font-mono w-16">
        {i + 1}
      </td>

      {/* Thumbnail */}
      <td className="px-6 py-3.5 whitespace-nowrap w-24">
        {category?.categoryImg && !imgError ? (
          <img
            src={category.categoryImg}
            alt={category?.categoryName || "Category"}
            onError={() => setImgError(true)}
            className="h-10 w-10 rounded-lg object-contain bg-muted/40 border border-border p-1"
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        )}
      </td>

      {/* Category Title & Slug */}
      <td className="px-6 py-3.5 font-medium text-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {category?.categoryName}
          </span>
          {category?.categoryNameBn && (
            <span className="text-xs text-muted-foreground font-normal">
              ({category.categoryNameBn})
            </span>
          )}
          {category?.featured && (
            <Badge variant="accent" className="text-[10px] py-0 px-1.5">
              Featured
            </Badge>
          )}
        </div>
        {category?.slug && (
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            /{category.slug}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-3.5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(category)}
            className="h-8 px-2.5 text-xs font-medium gap-1"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>

          <Button
            variant="ghost-destructive"
            size="icon-sm"
            onClick={() => onDelete?.(category)}
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
