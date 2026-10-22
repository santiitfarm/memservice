import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../ProductCard";

export function ProductRailSkeleton({ count = 6 }) {
  return (
    <section className="container mx-auto px-3 lg:px-6 mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/60 rounded animate-pulse" />
        </div>
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-pulse">
            <div className="w-full aspect-square bg-muted/60 rounded-xl" />
            <div className="h-4 w-3/4 bg-muted/80 rounded" />
            <div className="h-3 w-1/2 bg-muted/50 rounded" />
            <div className="h-6 w-1/3 bg-muted/70 rounded" />
            <div className="h-9 w-full bg-muted/90 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductRail({
  title = "Products",
  subtitle = "",
  viewAllUrl = "/shop",
  products = [],
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="container mx-auto px-3 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllUrl && (
          <Link
            href={viewAllUrl}
            className="group text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {products.map((product, idx) => (
          <ProductCard key={product?._id || product?.id || idx} product={product} />
        ))}
      </div>
    </section>
  );
}
