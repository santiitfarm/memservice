"use client";

import { useMenuContext } from "@/app/context/menuContext";
import { Filter, PanelLeftClose, SortAsc } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ShopToolBar = ({ products }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [sortValue, setSortValue] = useState("default");

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    const sortParam = params.get("sort");
    if (sortParam) {
      setSortValue(sortParam);
    }
  }, []);

  useEffect(() => {
    if (sortValue && sortValue !== "default") {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [sortValue]);

  const { isOpen, setIsOpen } = useMenuContext();
  const handleSortChange = (e) => {
    setSortValue(e.target.value);
  };

  return (
    <div className="container mx-auto">
      <div>
        <div className="flex justify-between lg:justify-end items-center border-b pb-4">
          <div className="lg:hidden">
            <button
              className="bg-light-mist text-deep-sea-blue p-2 rounded-lg border focus:outline-none flex items-center gap-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <>
                  <PanelLeftClose /> Hide Filters
                </>
              ) : (
                <>
                  <Filter /> Show Filters
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="items-center gap-4 hidden lg:flex">
              {products?.length <= 20 ? (
                <p>Showing 1–{products.length} results</p>
              ) : (
                <p>Showing 1–20 of {products.length} results</p>
              )}
            </div>

            <div className="flex items-center  bg-light-mist pl-2 rounded-lg">
              <SortAsc />
              <select
                className="bg-light-mist text-deep-sea-blue p-2  focus:outline-none"
                value={sortValue}
                onChange={handleSortChange}
              >
                <option value="default">Default sorting</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="new">Newest Arrivals</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopToolBar;
