import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  // Show top 8-12 categories
  const displayCats = categories.slice(0, 8);

  return (
    <section className="container mx-auto px-3 lg:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Featured Categories
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Explore authentic medicines and healthcare categories
          </p>
        </div>

        <Link
          href="/shop"
          className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 group"
        >
          <span>All Categories</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {displayCats.map((cat, idx) => {
          const slug = cat.slug || cat.categoryName;
          const img = cat.categoryImg || cat.image || "/assets/banner/01.jpg";

          return (
            <Link
              key={cat._id || idx}
              href={`/shop?category=${encodeURIComponent(slug)}`}
              className="group flex flex-col items-center p-3 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted/30 p-2 mb-2 flex items-center justify-center">
                <Image
                  src={img}
                  alt={cat.categoryName}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {cat.categoryName}
              </span>

              {cat.subCategory && cat.subCategory.length > 0 && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {cat.subCategory.length} subcategories
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
