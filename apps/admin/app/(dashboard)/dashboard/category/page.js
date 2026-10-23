"use client";

import React, { useState } from "react";
import { Layers, Plus, Search, RotateCcw } from "lucide-react";
import { useFetchCategoriesQuery } from "@/store/slices/CategoryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import CategoryForm from "./_components/CategoryForm";
import SingeCategory from "./_components/SingeCategory";
import RelativeModal from "../components/RelativeModal";

export default function CategoryAdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchCategoriesQuery();
  const categories = data?.categories || [];

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const filteredCategories = categories?.filter((category) =>
    (category.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            Categories & Taxonomy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage medicine classifications, health departments, and catalog hierarchy.
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
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {isOpen && (
          <RelativeModal setShowForm={toggleModal} title={"Add Category"}>
            <CategoryForm setShowForm={toggleModal} />
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
                placeholder="Search categories by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Total Categories: <strong>{categories.length}</strong>
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
              Failed to load categories: {error?.data?.message || error?.message || "Unknown error"}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Layers}
                title="No categories found"
                description={
                  searchQuery
                    ? `No categories matched "${searchQuery}".`
                    : "No categories have been added to the catalog yet."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-6 w-16">#</th>
                    <th className="py-3 px-6 w-24">Thumbnail</th>
                    <th className="py-3 px-6">Category Title</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCategories.map((category, i) => (
                    <SingeCategory key={category._id} category={category} i={i} />
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
