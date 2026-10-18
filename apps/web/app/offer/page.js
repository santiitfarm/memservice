import React from "react";
import ColumnCard from "../components/productCart/columnsCart/ColumnCard";

export default async function OfferPage({}) {
  const response = await fetch(`${process.env.API_URL}/api/product/offer`);
  const data = await response.json();

  return (
    <div className="container mx-auto px-3 lg:px-6  gap-6 mt-6 lg:mt-20 xl:mt-6 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-deep-sea-blue capitalize text-center">
        <strong>Exclusive Offer Products</strong>
      </h1>

      <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        {data?.offers?.map((product, ind) => (
          <div key={ind}>
            <ColumnCard productData={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
