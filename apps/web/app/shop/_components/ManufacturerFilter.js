"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ManufacturerFilter = ({ productData, initialSelectedManufacturers }) => {
  const drugManufacturers = [
    ...new Set(productData.map((product) => product.manufacturer_name)),
  ];

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [selectedManufacturers, setSelectedManufacturers] = useState(
    initialSelectedManufacturers
  );
  const [searchTerm, setSearchTerm] = useState("");

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    const manufacturer = params.get("manufacturer");

    if (manufacturer) {
      const decodedManufacturers = decodeURIComponent(manufacturer);
      setSelectedManufacturers(decodedManufacturers.split("|"));
    }
  }, []);

  useEffect(() => {
    if (selectedManufacturers.length > 0) {
      const encodedManufacturers = encodeURIComponent(
        selectedManufacturers.join("|")
      );
      params.set("manufacturer", encodedManufacturers);
    } else {
      params.delete("manufacturer");
    }
    replace(`${pathname}?${params.toString()}`);
  }, [selectedManufacturers]);

  const handleManufacturerToggle = (manufacturer) => {
    setSelectedManufacturers((prev) =>
      prev.includes(manufacturer)
        ? prev.filter((m) => m !== manufacturer)
        : [...prev, manufacturer]
    );
  };

  const filteredManufacturers = drugManufacturers.filter((manufacturer) =>
    manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 bg-white text-deep-sea-blue ">
      <h2 className="text-lg font-semibold mb-2">Manufacturer</h2>
      <input
        type="text"
        placeholder="Search for manufacturer"
        className="w-full p-2 mb-4 border transition-all duration-300 bg-light-mist focus:bg-white text-deep-sea-blue focus:border-sky-blue rounded-md outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto">
        {filteredManufacturers.map((manufacturer, i) => (
          <div key={i} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={manufacturer}
              checked={selectedManufacturers.includes(manufacturer)}
              onChange={() => handleManufacturerToggle(manufacturer)}
              className="mr-2"
            />
            <label htmlFor={manufacturer} className="text-sm">
              {manufacturer}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManufacturerFilter;
