"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import {
  Filter,
  X,
  ChevronDown,
  Star,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function CatalogListing({
  title = "Shop Products",
  subtitle = "Genuine medicines & healthcare essentials",
  items = [],
  total = 0,
  page = 1,
  pages = 1,
  limit = 24,
  facets = { categories: [], brands: [], priceRange: { min: 0, max: 2000 } },
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active filters from URL
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("rating") || "";
  const currentSearch = searchParams.get("q") || searchParams.get("search") || "";

  // Local state for price inputs
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Helper to update URL params and reset page to 1
  const updateParams = (newEntries) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 on filter/sort change unless page is explicitly set
    if (!newEntries.page) {
      params.delete("page");
    }

    for (const [key, val] of Object.entries(newEntries)) {
      if (val === null || val === "" || val === false) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleCategoryToggle = (catSlug) => {
    const activeList = currentCategory ? currentCategory.split(",").filter(Boolean) : [];
    const exists = activeList.includes(catSlug);
    const updated = exists ? activeList.filter((s) => s !== catSlug) : [...activeList, catSlug];
    updateParams({ category: updated.length > 0 ? updated.join(",") : null });
  };

  const handleBrandToggle = (brandSlug) => {
    const activeList = currentBrand ? currentBrand.split(",").filter(Boolean) : [];
    const exists = activeList.includes(brandSlug);
    const updated = exists ? activeList.filter((s) => s !== brandSlug) : [...activeList, brandSlug];
    updateParams({ brand: updated.length > 0 ? updated.join(",") : null });
  };

  const handlePriceApply = (e) => {
    if (e) e.preventDefault();
    updateParams({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
  };

  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const selectedCategories = currentCategory ? currentCategory.split(",").filter(Boolean) : [];
  const selectedBrands = currentBrand ? currentBrand.split(",").filter(Boolean) : [];

  const hasActiveFilters = Boolean(
    selectedCategories.length > 0 ||
      selectedBrands.length > 0 ||
      currentInStock ||
      currentMinPrice ||
      currentMaxPrice ||
      currentRating ||
      currentSearch
  );

  // Render Sidebar Filters Content (shared between Desktop & Mobile Sheet)
  const renderFilterPanel = () => (
    <div className="space-y-6 text-sm">
      {/* Search active notice */}
      {currentSearch && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between">
          <span>Search: &ldquo;{currentSearch}&rdquo;</span>
          <button
            onClick={() => updateParams({ q: null, search: null })}
            className="text-primary hover:underline font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {/* In Stock Toggle */}
      <div className="pb-4 border-b border-border">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            In-Stock Only
          </span>
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : null })}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer"
          />
        </label>
      </div>

      {/* Price Range */}
      <div className="pb-5 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Price Range (৳ BDT)
          </h4>
          {(currentMinPrice || currentMaxPrice) && (
            <button
              onClick={() => {
                setMinPriceInput("");
                setMaxPriceInput("");
                updateParams({ minPrice: null, maxPrice: null });
              }}
              className="text-[11px] text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <form onSubmit={handlePriceApply} className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-border bg-muted/40 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-3 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Go
          </button>
        </form>
      </div>

      {/* Categories Facet */}
      {facets?.categories?.length > 0 && (
        <div className="pb-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => updateParams({ category: null })}
                className="text-[11px] text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {facets.categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.slug || cat.name);
              return (
                <label
                  key={cat._id || cat.slug}
                  className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(cat.slug || cat.name)}
                      className="rounded text-primary focus:ring-primary border-border"
                    />
                    <span className={`truncate ${isChecked ? "font-semibold text-primary" : "text-foreground"}`}>
                      {cat.name}
                    </span>
                  </div>
                  {cat.count != null && (
                    <span className="text-[11px] text-muted-foreground ml-2">
                      ({cat.count})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Brands Facet */}
      {facets?.brands?.length > 0 && (
        <div className="pb-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Brands
            </h4>
            {selectedBrands.length > 0 && (
              <button
                onClick={() => updateParams({ brand: null })}
                className="text-[11px] text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {facets.brands.map((b) => {
              const isChecked = selectedBrands.includes(b.slug || b.name);
              return (
                <label
                  key={b._id || b.slug}
                  className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-muted/50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandToggle(b.slug || b.name)}
                      className="rounded text-primary focus:ring-primary border-border"
                    />
                    <span className={`truncate ${isChecked ? "font-semibold text-primary" : "text-foreground"}`}>
                      {b.name}
                    </span>
                  </div>
                  {b.count != null && (
                    <span className="text-[11px] text-muted-foreground ml-2">
                      ({b.count})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="pb-2 space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Customer Rating
        </h4>
        {[4, 3, 2].map((stars) => {
          const isSelected = currentRating === String(stars);
          return (
            <button
              key={stars}
              type="button"
              onClick={() => updateParams({ rating: isSelected ? null : stars })}
              className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-xs transition-colors ${
                isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center text-amber-500">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-500" />
                ))}
              </div>
              <span>& above</span>
              {isSelected && <Check size={14} className="ml-auto text-primary" />}
            </button>
          );
        })}
      </div>

      {/* Clear All Action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-3 lg:px-6 py-6 md:py-8">
      {/* Header Banner & Title */}
      <div className="mb-6 pb-4 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>

        {/* Toolbar: Result count & Sort dropdown */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <span className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{items.length}</strong> of{" "}
            <strong className="text-foreground">{total}</strong> products
          </span>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="popular">Sort: Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0 flex flex-col bg-card">
                <SheetHeader className="p-4 border-b border-border text-left">
                  <SheetTitle className="text-base font-bold text-foreground">
                    Filters & Refinements
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                  {renderFilterPanel()}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-muted/40 border border-border">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            Active Filters:
          </span>

          {selectedCategories.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryToggle(c)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>{c}</span>
              <X size={12} />
            </button>
          ))}

          {selectedBrands.map((b) => (
            <button
              key={b}
              onClick={() => handleBrandToggle(b)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>Brand: {b}</span>
              <X size={12} />
            </button>
          ))}

          {currentInStock && (
            <button
              onClick={() => updateParams({ inStock: null })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>In-Stock Only</span>
              <X size={12} />
            </button>
          )}

          {(currentMinPrice || currentMaxPrice) && (
            <button
              onClick={() => updateParams({ minPrice: null, maxPrice: null })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>৳{currentMinPrice || 0} - ৳{currentMaxPrice || "max"}</span>
              <X size={12} />
            </button>
          )}

          {currentRating && (
            <button
              onClick={() => updateParams({ rating: null })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-rose-400 hover:text-rose-500 transition-colors"
            >
              <span>★ {currentRating}+</span>
              <X size={12} />
            </button>
          )}

          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-primary hover:underline ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Filter Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <Filter size={16} className="text-primary" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {renderFilterPanel()}
        </aside>

        {/* Product Grid & Pagination (9 cols) */}
        <div className={`w-full lg:col-span-9 transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {items.map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} />
                ))}
              </div>

              {/* Server-Side Pagination */}
              {pages > 1 && (
                <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: page - 1 })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((pNum) => {
                      // Show active page, first, last, and window around active
                      if (
                        pNum === 1 ||
                        pNum === pages ||
                        (pNum >= page - 2 && pNum <= page + 2)
                      ) {
                        const isActive = pNum === page;
                        return (
                          <button
                            key={pNum}
                            type="button"
                            onClick={() => updateParams({ page: pNum })}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "border border-border bg-card text-foreground hover:bg-muted"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      }
                      if (pNum === page - 3 || pNum === page + 3) {
                        return (
                          <span key={pNum} className="text-muted-foreground px-1 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => updateParams({ page: page + 1 })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 rounded-2xl border border-border bg-card shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Filter size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                No products found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any items matching your current filters. Try resetting the filters or searching for something else.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
