"use client";

import { useMenuContext } from "@/app/context/menuContext";
import CategoryFilter from "./CategoryFilter";
import ManufacturerFilter from "./ManufacturerFilter";
import ProductTypes from "./ProductTypes";

export default function FilterComponents({
  filterCategories,
  filterManufacturers,
  filterProductTypes,
  categories,
  manufacturers,
  productTypes,
}) {
  const { isOpen } = useMenuContext();

  return (
    <div
      className={`absolute lg:static top-20 left-0 z-30 w-full md:w-2/5 bg-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-300 h-full flex flex-col`}
    >
      {/* Scrollable content */}
      <div className="h-full top-0 overflow-y-auto">
        <CategoryFilter
          productData={filterCategories}
          initialSelectedCategories={categories}
        />
        <ManufacturerFilter
          productData={filterManufacturers}
          initialSelectedManufacturers={manufacturers}
        />
        <ProductTypes
          productData={filterProductTypes}
          initialSelectedProductTypes={productTypes}
        />
      </div>
    </div>
  );
}
