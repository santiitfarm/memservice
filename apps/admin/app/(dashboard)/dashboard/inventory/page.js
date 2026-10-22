"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  SlidersHorizontal,
  History,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useFetchProductsQuery } from "@/store/slices/productApi";
import StockAdjustmentModal from "./_components/StockAdjustmentModal";
import StockMovementHistoryModal from "./_components/StockMovementHistoryModal";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'low' | 'out'
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchProductsQuery();
  const products = data?.products || [];

  // Flatten products and variants into trackable inventory items
  const inventoryItems = useMemo(() => {
    const list = [];
    products.forEach((p) => {
      const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
      if (hasVariants) {
        p.variants.forEach((v) => {
          list.push({
            id: `${p._id}_${v.sku}`,
            productId: p._id,
            productName: p.name,
            sku: v.sku || "N/A",
            variantSku: v.sku,
            variantLabel: [v.packSize, v.strength, v.color].filter(Boolean).join(" - ") || v.sku,
            currentStock: Number(v.stock || 0),
            price: Number(v.discountPrice || v.regularPrice || 0),
            categoryName: p.category?.categoryName || "—",
            brandTitle: p.brand?.title || "—",
            image: p.images?.[0] || "/placeholder.png",
            isVariant: true,
            totalProductStock: Number(p.stock || 0),
          });
        });
      } else {
        list.push({
          id: p._id,
          productId: p._id,
          productName: p.name,
          sku: p.sku || "N/A",
          variantSku: null,
          variantLabel: null,
          currentStock: Number(p.stock || 0),
          price: Number(p.discountPrice || p.price || 0),
          categoryName: p.category?.categoryName || "—",
          brandTitle: p.brand?.title || "—",
          image: p.images?.[0] || "/placeholder.png",
          isVariant: false,
          totalProductStock: Number(p.stock || 0),
        });
      }
    });
    return list;
  }, [products]);

  // Aggregate stats
  const totalUnits = useMemo(() => {
    return inventoryItems.reduce((acc, item) => acc + item.currentStock, 0);
  }, [inventoryItems]);

  const lowStockCount = useMemo(() => {
    return inventoryItems.filter((i) => i.currentStock > 0 && i.currentStock <= 5).length;
  }, [inventoryItems]);

  const outOfStockCount = useMemo(() => {
    return inventoryItems.filter((i) => i.currentStock <= 0).length;
  }, [inventoryItems]);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      // Stock filter
      if (stockFilter === "low" && !(item.currentStock > 0 && item.currentStock <= 5)) {
        return false;
      }
      if (stockFilter === "out" && item.currentStock > 0) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = item.productName.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesVariant = item.variantLabel?.toLowerCase().includes(query);
        const matchesCategory = item.categoryName.toLowerCase().includes(query);
        return matchesName || matchesSku || matchesVariant || matchesCategory;
      }

      return true;
    });
  }, [inventoryItems, stockFilter, searchTerm]);

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      );
    }
    if (stock <= 5) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Low Stock ({stock})
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="w-3 h-3" />
        In Stock ({stock})
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="w-7 h-7 text-primary" />
            Inventory & Stock Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time stock monitoring, quick SKU adjustments, and historical movement audit logs.
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
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/dashboard/products">
            <Button size="sm" className="gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
              Total Tracked SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-16" /> : inventoryItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {products.length} products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-muted-foreground">
              Total Units in Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-20" /> : totalUnits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Physical inventory on hand
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === "low" ? "ring-2 ring-amber-500 bg-amber-50/20 dark:bg-amber-950/20" : ""
          }`}
          onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Low Stock Alert</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {isLoading ? <Skeleton className="h-8 w-14" /> : lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              SKUs with stock &le; 5 units
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            stockFilter === "out" ? "ring-2 ring-red-500 bg-red-50/20 dark:bg-red-950/20" : ""
          }`}
          onClick={() => setStockFilter(stockFilter === "out" ? "all" : "out")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold text-red-600 dark:text-red-400 flex items-center justify-between">
              <span>Out of Stock</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {isLoading ? <Skeleton className="h-8 w-14" /> : outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              SKUs completely sold out
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStockFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  stockFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All SKUs ({inventoryItems.length})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter("low")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  stockFilter === "low"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Low Stock ({lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => setStockFilter("out")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  stockFilter === "out"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Out of Stock ({outOfStockCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by product, SKU, variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items Table */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground">
              Stock Items ({filteredItems.length})
            </CardTitle>
            {stockFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStockFilter("all")}
                className="text-xs h-7"
              >
                Clear filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-destructive font-medium">
                Failed to load inventory: {error?.data?.message || error?.message || "Unknown error"}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Boxes}
                title="No inventory items found"
                description={
                  searchTerm
                    ? `No products or SKUs matched your search "${searchTerm}".`
                    : "No inventory items in this filter tab."
                }
                action={
                  searchTerm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category / Brand</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Item Details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={44}
                            height={44}
                            className="rounded-lg object-cover bg-muted border border-border/80 h-11 w-11 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/dashboard/products/${item.productId}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors hover:underline text-sm line-clamp-1"
                            >
                              {item.productName}
                            </Link>
                            {item.isVariant ? (
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-muted font-medium text-foreground">
                                  {item.variantLabel}
                                </span>
                                <span>• Parent total: {item.totalProductStock}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Standard Single Item
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded font-semibold text-foreground">
                          {item.sku}
                        </span>
                      </td>

                      {/* Category / Brand */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <div>{item.categoryName}</div>
                        <div className="text-[11px] text-muted-foreground/70">{item.brandTitle}</div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-base font-bold ${
                            item.currentStock <= 0
                              ? "text-red-600 dark:text-red-400"
                              : item.currentStock <= 5
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-foreground"
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {getStockBadge(item.currentStock)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItemForAdjust(item)}
                            className="h-8 gap-1 text-xs"
                            title="Adjust Stock"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Adjust
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItemForHistory(item)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="View Movement History"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentModal
        isOpen={Boolean(selectedItemForAdjust)}
        onClose={() => setSelectedItemForAdjust(null)}
        item={selectedItemForAdjust}
      />

      {/* Stock Movement History Dialog */}
      <StockMovementHistoryModal
        isOpen={Boolean(selectedItemForHistory)}
        onClose={() => setSelectedItemForHistory(null)}
        item={selectedItemForHistory}
      />
    </div>
  );
}
