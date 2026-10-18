"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";

function Search() {
  const [allProducts, setAllProducts] = useState([]);

  const [filterProduct, setFilterProduct] = useState([]);
  const [value, setValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Category");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/shop`
      );
      const data = await response.json();

      setAllProducts(data?.products);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search") || "";
    const categoryQuery = searchParams.get("category") || "Category";

    setValue(searchQuery);
    setSelectedCategory(categoryQuery);

    const filtered = allProducts.filter(
      (product) =>
        (categoryQuery === "Category" || product.category === categoryQuery) &&
        product?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilterProduct(filtered);
  }, [searchParams, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setValue(searchValue);
    setIsDropdownOpen(true);

    const filtered = allProducts.filter(
      (product) =>
        product?.title.toLowerCase().includes(searchValue.toLowerCase()) &&
        (selectedCategory === "Category" ||
          product.category === selectedCategory)
    );
    setFilterProduct(filtered);
  };

  const handleOptionClick = (product) => {
    setValue(product?.title);
    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    const filtered = allProducts.filter(
      (product) =>
        (category === "Category" || product.category === category) &&
        product?.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilterProduct(filtered);
    setIsDropdownOpen(true);
  };

  const handleSearchClick = () => {
    const query = new URLSearchParams();
    if (value) query.set("search", value);
    if (selectedCategory !== "Category")
      query.set("category", selectedCategory);

    router.push(`/shop?${query}`);
  };

  return (
    <div ref={containerRef} className="relative text-sm w-full">
      {/* Select Dropdown */}
      <div className="absolute left-0 top-0 flex items-center justify-center w-2/12 h-full z-20 pl-5">
        <select
          name="categories"
          id="category-select"
          className="w-full flex bg-transparent focus:outline-none py-4 cursor-pointer text-deep-sea-blue opacity-75"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option>Category</option>
          {allProducts.map((product, index) => (
            <option key={index} value={product.category}>
              {product.category}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div className="relative overflow-hidden">
        <input
          ref={inputRef}
          className="w-full h-12 rounded-full px-5 placeholder:text-deep-sea-blue bg-light-mist focus:outline-none pl-[18%] z-10"
          type="search"
          placeholder="Search..."
          value={value}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>

      {/* Search Icon Inside Input */}
      <div
        onClick={handleSearchClick}
        className="absolute top-0 right-0 flex items-center justify-center text-white text-2xl bg-sunset-orange transition-all duration-300 hover:bg-deep-sea-blue w-1/12 h-full rounded-r-full cursor-pointer z-20"
      >
        <CiSearch />
      </div>

      {/* Dropdown for Filtered Products */}
      {isDropdownOpen && (
        <ul className="bg-white absolute top-full left-0 w-full border border-gray-300 max-h-60 overflow-y-auto z-10 rounded-lg">
          {filterProduct?.length > 0 ? (
            filterProduct.map((product) => (
              <Link key={product?.id} href={`/product/${product?.id}`} passHref>
                <li
                  onClick={() => handleOptionClick(product)}
                  className="p-1 max-h-20 cursor-pointer border-b border-gray-200 hover:bg-cyan-50 text-black"
                >
                  <div className="w-fit p-2 flex">
                    <Image
                      src={product?.image}
                      alt={product?.title}
                      width={50}
                      height={150}
                      className="object-contain h-16 w-16"
                    />
                    <div className="ml-4 text-black grid">
                      <strong>{product?.title}</strong>
                      <div className="flex gap-4">
                        <span className="text-xs text-emerald-900 font-semibold">
                          ৳{product?.currentPrice}
                        </span>
                        {product?.discount > 0 && (
                          <del className="text-xs text-red-600 font-semibold">
                            ৳{product?.oldPrice}
                          </del>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              </Link>
            ))
          ) : (
            <li className="p-2">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default Search;
