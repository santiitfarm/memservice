"use client";

import React, { useState } from "react";
import { Award, Plus, Search, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";
import {
  useFetchBrandsQuery,
  useDeleteBrandMutation,
} from "@/store/slices/brandApi";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import BrandForm from "./_componenets/BrandForm";
import SingeBrand from "./_componenets/SingeBrand";

export default function BrandsAdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);

  const { data, error, isError, isLoading, isSuccess, refetch, isFetching } =
    useFetchBrandsQuery();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const brands = (isSuccess && data?.brands) || [];

  const filteredBrands = brands.filter((brand) => {
    const q = searchQuery.toLowerCase();
    const title = (brand.title || "").toLowerCase();
    const slug = (brand.slug || "").toLowerCase();
    const cat = (brand.category?.categoryName || "").toLowerCase();
    return title.includes(q) || slug.includes(q) || cat.includes(q);
  });

  const handleOpenAddModal = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    const brandId = brandToDelete._id || brandToDelete.id;
    try {
      const res = await deleteBrand(brandId).unwrap();
      toast.success(res?.message || "Brand deleted successfully");
      setBrandToDelete(null);
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Failed to delete brand"
      );
      setBrandToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-7 h-7 text-primary" />
            Brands & Pharmaceutical Partners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pharmaceutical manufacturers, homepage slider order, and official brand logos.
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
            <RotateCcw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={handleOpenAddModal} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Brand
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brands by company, slug, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Total Brands: <strong>{brands.length}</strong>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border-b border-border/60">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-7 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load brands: {error?.data?.message || error?.message || "Unknown error"}
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Award}
                title="No brands found"
                description={
                  searchQuery
                    ? `No brands matched "${searchQuery}".`
                    : "No pharmaceutical brands configured yet."
                }
                action={
                  <Button size="sm" onClick={handleOpenAddModal} className="mt-2">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create First Brand
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-6 w-16">#</th>
                    <th className="py-3 px-6 w-24">Logo</th>
                    <th className="py-3 px-6">Brand Title</th>
                    <th className="py-3 px-6 w-24">Slider Order</th>
                    <th className="py-3 px-6">Category</th>
                    <th className="py-3 px-6 w-28">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBrands.map((brand, i) => (
                    <SingeBrand
                      key={brand._id || brand.id}
                      brand={brand}
                      i={i}
                      onEdit={handleOpenEditModal}
                      onDelete={setBrandToDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedBrand ? "Edit Brand" : "Add New Brand"}
        description="Configure pharmaceutical manufacturer, slider order, category, and official logo."
        maxWidth="max-w-xl"
      >
        <BrandForm
          brand={selectedBrand}
          isEdit={Boolean(selectedBrand)}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            refetch();
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(brandToDelete)}
        onClose={() => setBrandToDelete(null)}
        onConfirm={handleDeleteBrand}
        title="Delete Brand"
        description={`Are you sure you want to delete brand "${brandToDelete?.title}"? This cannot be undone if products are linked.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </div>
  );
}
