"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Layers,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  useFetchProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/store/slices/productApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ProductDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [productToDelete, setProductToDelete] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchProductsQuery();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const rawProducts = data?.products || [];

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    try {
      await updateProduct({
        _id: product._id,
        status: newStatus,
      }).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete._id).unwrap();
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return rawProducts.filter((product) => {
      // Status filter
      if (statusFilter !== "all" && product.status !== statusFilter) return false;

      // Stock filter
      if (stockFilter === "low") {
        const threshold = product.lowStockThreshold || 5;
        if (product.stock > threshold) return false;
      } else if (stockFilter === "out") {
        if (product.stock > 0) return false;
      } else if (stockFilter === "in") {
        if (product.stock <= 0) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const name = (product.name || "").toLowerCase();
        const generic = (product.generic_name || "").toLowerCase();
        const manufacturer = (product.manufacturer_name || "").toLowerCase();
        const brand = (product.brand?.title || "").toLowerCase();
        const cat = (product.category?.categoryName || "").toLowerCase();
        return (
          name.includes(q) ||
          generic.includes(q) ||
          manufacturer.includes(q) ||
          brand.includes(q) ||
          cat.includes(q)
        );
      }

      return true;
    });
  }, [rawProducts, statusFilter, stockFilter, searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Product Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage medicines, OTC health products, pricing and variants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link href="/dashboard/products/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Failed to load products: {error?.data?.message || error?.message || "Unknown error"}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader className="p-4 space-y-3">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by title, generic, brand, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Inventory</option>
                <option value="in">In Stock (&gt;0)</option>
                <option value="low">Low Stock (≤5)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Products Found"
                description={
                  searchTerm || statusFilter !== "all" || stockFilter !== "all"
                    ? "No products matched your search or filters."
                    : "Get started by adding your first product to the catalog."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-6">Product</th>
                    <th className="p-3.5">Category / Brand</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Variants</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground">
                  {filteredProducts.map((product) => {
                    const variantCount = Array.isArray(product.variants)
                      ? product.variants.length
                      : 0;

                    const effectivePrice =
                      Number(product.discount_price) > 0
                        ? product.discount_price
                        : product.regular_price;

                    const isLowStock =
                      Number(product.stock) <= (product.lowStockThreshold || 5);
                    const isOutOfStock = Number(product.stock) <= 0;

                    return (
                      <tr key={product._id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border/60">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/products/${product._id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 text-sm"
                              >
                                {product.name}
                              </Link>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">
                                {product.generic_name && (
                                  <span>{product.generic_name} • </span>
                                )}
                                {product.manufacturer_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-medium text-foreground">
                            {product.category?.categoryName || "General"}
                          </div>
                          {product.brand?.title && (
                            <span className="text-[11px] text-muted-foreground">
                              {product.brand.title}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 font-bold">
                          <div>৳{Number(effectivePrice).toLocaleString()}</div>
                          {Number(product.discount_price) > 0 && (
                            <div className="text-[10px] text-muted-foreground line-through">
                              ৳{Number(product.regular_price).toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          {variantCount > 0 ? (
                            <Badge variant="default" size="sm" className="gap-1">
                              <Layers className="w-3 h-3" /> {variantCount} variants
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Single</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              isOutOfStock
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                : isLowStock
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${product.stock} in stock`}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.status === "active"}
                              onChange={() => handleToggleStatus(product)}
                            />
                            <span className="text-[11px] text-muted-foreground capitalize">
                              {product.status || "active"}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/dashboard/inventory?product=${product._id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px]"
                                title="Adjust Stock"
                              >
                                Stock
                              </Button>
                            </Link>

                            <Link href={`/dashboard/products/${product._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductToDelete(product)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${productToDelete?.name}"?`}
        message="Are you sure you want to delete this product? It will be removed from storefront catalog listings."
        confirmText="Delete Product"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
