"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const CategoryFilter = ({ productData, initialSelectedCategories }) => {
  const categories = [
    ...new Set(productData.map((product) => product.category)),
  ];

  const searchParams = useSearchParams();

  const pathname = usePathname();
  const { replace } = useRouter();

  const [selectedCategories, setSelectedCategories] = useState(
    initialSelectedCategories
  );
  const [searchTerm, setSearchTerm] = useState("");

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    const category = params.get("category");

    if (category) {
      const decodedCategories = decodeURIComponent(category);
      setSelectedCategories(decodedCategories.split("|"));
    }
  }, []);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      const encodedCategories = encodeURIComponent(
        selectedCategories.join("|")
      );
      params.set("category", encodedCategories);
    } else {
      params.delete("category");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [selectedCategories]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 bg-white text-deep-sea-blue ">
      <h2 className="text-lg font-semibold mb-2">Category</h2>
      <input
        type="text"
        placeholder="Search for category"
        className="w-full p-2 mb-4 border transition-all duration-300 bg-light-mist focus:bg-white text-deep-sea-blue focus:border-sky-blue rounded-md outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto">
        {filteredCategories.map((category, i) => (
          <div key={i} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={category}
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryToggle(category)}
              className="mr-2"
            />
            <label htmlFor={category} className="text-sm">
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
