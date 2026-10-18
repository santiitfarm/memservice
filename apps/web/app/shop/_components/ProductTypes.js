"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ProductTypes = ({ productData, initialSelectedProductTypes }) => {
  const productTypes = [
    ...new Set(productData.map((product) => product.product_type)),
  ];

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [selectedTypes, setSelectedTypes] = useState(
    initialSelectedProductTypes || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    const productTypeParam = params.get("productType");
    if (productTypeParam) {
      const decodedTypes = decodeURIComponent(productTypeParam).split("|");
      setSelectedTypes(decodedTypes);
    }
  }, []);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      const encodedTypes = encodeURIComponent(selectedTypes.join("|"));
      params.set("productType", encodedTypes);
    } else {
      params.delete("productType");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [selectedTypes]);

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredTypes = productTypes.filter((type) =>
    type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 bg-white text-deep-sea-blue">
      <h2 className="text-lg font-semibold mb-2">Product Types</h2>
      <input
        type="text"
        placeholder="Search for product types"
        className="w-full p-2 mb-4 border transition-all duration-300 bg-light-mist focus:bg-white text-deep-sea-blue focus:border-sky-blue rounded-md outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {filteredTypes.map((type, i) => (
          <button
            key={i}
            onClick={() => handleTypeToggle(type)}
            className={`px-4 py-2 text-sm rounded-md border ${
              selectedTypes.includes(type)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 text-gray-700 border-gray-300"
            } hover:bg-blue-100 hover:text-black`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductTypes;
