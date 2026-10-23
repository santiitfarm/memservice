"use client";

import React from "react";
import Link from "next/link";
import { PackagePlus, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import AddProductForm from "./components/AddProductForm";

export default function AddProductPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PackagePlus className="w-7 h-7 text-primary" />
            Add New Product
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create medicines, medical supplies, and healthcare products with bilingual descriptions and variants.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs text-card-foreground">
        <AddProductForm />
      </div>
    </div>
  );
}
