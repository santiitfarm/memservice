"use client";

import React from "react";
import { Plus, Trash2, Layers, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function VariantsEditor({ variants = [], onChange }) {
  const handleAddVariant = () => {
    const newVariant = {
      sku: "",
      label: "",
      attributes: {
        packSize: "",
        color: "",
        strength: "",
      },
      regularPrice: 0,
      discountPrice: 0,
      stock: 0,
      status: "active",
    };
    onChange([...variants, newVariant]);
  };

  const handleRemoveVariant = (index) => {
    const updated = variants.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...variants];
    if (field.startsWith("attr.")) {
      const attrKey = field.replace("attr.", "");
      updated[index] = {
        ...updated[index],
        attributes: {
          ...(updated[index].attributes || {}),
          [attrKey]: value,
        },
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Product Variants
          </h4>
          <p className="text-xs text-muted-foreground">
            Manage different pack sizes, strengths, or colors with dedicated SKUs and pricing
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddVariant}
          className="gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="p-6 border border-dashed border-border rounded-lg text-center bg-muted/20">
          <p className="text-xs text-muted-foreground">
            No variants configured. This product will be sold as a single item with its default price and stock.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddVariant}
            className="mt-2 text-xs text-primary hover:underline"
          >
            + Create first variant
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-2.5 pl-4">Variant Label</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Pack Size / Strength</th>
                  <th className="p-2.5">Regular Price</th>
                  <th className="p-2.5">Discount Price</th>
                  <th className="p-2.5">Stock</th>
                  <th className="p-2.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="p-2 pl-4">
                      <input
                        type="text"
                        placeholder="e.g. 10 Tablets Pack"
                        value={v.label || ""}
                        onChange={(e) => handleChange(idx, "label", e.target.value)}
                        className="w-36 px-2.5 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="e.g. PARA-500-10"
                        value={v.sku || ""}
                        onChange={(e) => handleChange(idx, "sku", e.target.value.toUpperCase())}
                        className="w-28 px-2.5 py-1 text-xs font-mono bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>

                    <td className="p-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Pack Size"
                          value={v.attributes?.packSize || ""}
                          onChange={(e) => handleChange(idx, "attr.packSize", e.target.value)}
                          className="w-24 px-2 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="Strength"
                          value={v.attributes?.strength || ""}
                          onChange={(e) => handleChange(idx, "attr.strength", e.target.value)}
                          className="w-20 px-2 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.regularPrice ?? ""}
                        onChange={(e) => handleChange(idx, "regularPrice", Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.discountPrice ?? ""}
                        onChange={(e) => handleChange(idx, "discountPrice", Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock ?? ""}
                        onChange={(e) => handleChange(idx, "stock", parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 text-xs bg-muted/20 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>

                    <td className="p-2 pr-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(idx)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
