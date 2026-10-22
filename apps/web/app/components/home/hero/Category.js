import Image from "next/image";
import Link from "next/link";
//import lucide icon
import { ChevronRight } from "lucide-react";

async function Category() {
  const response = await fetch(`${process.env.API_URL}/api/category`);
  const data = await response.json();
  const categoryData = data?.categories ?? [];

  if (!categoryData.length) return null;

  return (
    <section className="relative flex max-h-[475px] w-full flex-col rounded-lg border border-border bg-card shadow-sm">
      <h2 className="border-b border-border bg-muted/40 px-6 py-3 text-xs font-bold uppercase tracking-widest text-foreground rounded-t-lg">
        Categories
      </h2>
      {/* Category Sidebar */}
      <div className="overflow-y-visible">
        {categoryData.map((category, ind) => (
          <div key={ind} className="group relative">
            <Link
              href={`/shop?category=${encodeURIComponent(category?.categoryName)}`}
              className="capitalize text-foreground transition-all duration-200 hover:bg-muted/60 hover:text-primary text-[14px] font-medium block px-6 py-2.5 border-b border-border last:border-b-0"
            >
              <p className="flex items-center justify-between">
                <span>{category?.categoryName}</span>
                {category?.subCategory && category.subCategory.length > 0 && (
                  <span className="transition-all duration-200 group-hover:translate-x-1 text-muted-foreground group-hover:text-primary">
                    <ChevronRight size={15} strokeWidth={1.5} />
                  </span>
                )}
              </p>
            </Link>
            {/* Subcategories Flyout */}
            {category?.subCategory && category.subCategory.length > 0 && (
              <div className="absolute z-50 top-0 left-full ml-1 w-[480px] bg-card rounded-lg border border-border shadow-2xl hidden group-hover:block p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border">
                  {category?.categoryName} Subcategories
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {category?.subCategory.map((subCategory, subInd) => (
                    <Link
                      key={subInd}
                      href={`/shop?category=${encodeURIComponent(category?.categoryName)}&subCategory=${encodeURIComponent(subCategory?.name)}`}
                      className="text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 p-2 rounded-md transition-colors"
                    >
                      {subCategory?.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Category;
