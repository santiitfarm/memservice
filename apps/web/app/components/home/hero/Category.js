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
    <section className="relative flex max-h-[475px] w-full flex-col overflow-hidden rounded-lg border border-light-mist bg-white shadow-sm">
      <h2 className="border-b border-light-mist bg-light-mist/60 px-6 py-3 text-xs font-bold uppercase tracking-widest text-deep-sea-blue">
        Categories
      </h2>
      {/* Category Sidebar */}
      <div className="overflow-y-auto">
        {categoryData.map((category, ind) => (
          <div key={ind} className="group relative">
            <Link
              href={`/shop?category=${encodeURIComponent(category?.categoryName)}`}
              className="capitalize text-deep-sea-blue transition-all duration-300 hover:bg-light-mist/60 hover:text-sky-blue text-[15px] font-semibold block px-6 py-3 border-b border-light-mist last:border-b-0"
            >
              <p className="flex items-center justify-between">
                {category?.categoryName}
                {category?.subCategory && (
                  <span className="transition-all duration-300 group-hover:translate-x-2">
                    <ChevronRight size={16} strokeWidth={1.5} />
                  </span>
                )}
              </p>
            </Link>
            {/* Subcategories */}
            {category?.subCategory && (
              <div className="absolute z-50 top-0 left-full w-[1200px] bg-white shadow-lg hidden group-hover:block">
                <div className="grid grid-cols-6 gap-4 p-4">
                  {category?.subCategory.map((subCategory, subInd) => (
                    <div key={subInd} className="text-gray-700">
                      <p>{subCategory?.name}</p>
                    </div>
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
