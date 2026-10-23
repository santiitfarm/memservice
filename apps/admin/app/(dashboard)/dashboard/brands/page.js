"use client";

import React, { useState } from "react";
import { Award, Plus, Search, RotateCcw } from "lucide-react";
import { useFetchBrandsQuery } from "@/store/slices/brandApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import RelativeModal from "../components/RelativeModal";
import BrandForm from "./_componenets/BrandForm";
import SingeBrand from "./_componenets/SingeBrand";

export default function BrandsAdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, error, isError, isLoading, isSuccess, refetch, isFetching } =
    useFetchBrandsQuery();
  const brands = (isSuccess && data?.brands) || [];

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const filteredBrands = brands.filter((brand) =>
    (brand.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          <Button size="sm" onClick={toggleModal} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Brand
          </Button>
        </div>

        {isOpen && (
          <RelativeModal setShowForm={toggleModal} title={"Add Brand"}>
            <BrandForm setShowForm={toggleModal} />
          </RelativeModal>
        )}
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search brands by company or generic title..."
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
                    <SingeBrand key={brand._id || brand.id} brand={brand} i={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
