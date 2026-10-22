import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Category({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  // Limit sidebar categories to top 10 for clean alignment with hero banner height
  const displayCategories = categories.slice(0, 10);

  return (
    <section className="relative flex w-full flex-col rounded-xl border border-border bg-card shadow-sm h-full">
      <h2 className="border-b border-border bg-muted/40 px-5 py-3 text-xs font-bold uppercase tracking-wider text-foreground rounded-t-xl flex items-center justify-between">
        <span>Categories</span>
        <span className="text-[10px] text-muted-foreground font-semibold lowercase">All</span>
      </h2>

      {/* Categories Vertical Rail */}
      <div className="py-1">
        {displayCategories.map((category, ind) => {
          const hasSubs = category?.subCategory && category.subCategory.length > 0;
          const catSlug = category?.slug || category?.categoryName;

          return (
            <div key={category._id || ind} className="group relative">
              <Link
                href={`/shop?category=${encodeURIComponent(catSlug)}`}
                className="flex items-center justify-between px-5 py-2.5 text-xs font-medium text-foreground hover:bg-muted/70 hover:text-primary transition-colors border-b border-border/40 last:border-b-0"
              >
                <span className="truncate pr-2">{category?.categoryName}</span>
                {hasSubs && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  />
                )}
              </Link>

              {/* Subcategories Flyout Dropdown */}
              {hasSubs && (
                <div className="absolute top-0 left-full ml-2 w-72 sm:w-80 rounded-xl border border-border bg-card shadow-2xl p-4 hidden group-hover:block z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border">
                    {category?.categoryName}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {category.subCategory.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={`/shop?category=${encodeURIComponent(catSlug)}&subCategory=${encodeURIComponent(sub?.name || sub)}`}
                        className="text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/60 p-2 rounded-lg transition-colors truncate"
                      >
                        {sub?.name || sub}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
