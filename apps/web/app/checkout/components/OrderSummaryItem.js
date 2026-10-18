import Image from "next/image";
import React from "react";

export default function OrderSummaryItem({ product }) {
  return (
    <div
      key={product.id}
      className="p-3 grid xl:grid-cols-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-2 border-b text-[#56778F]"
    >
      <div className="col-span-2">
        <Image
          src={product.image}
          alt={product.title}
          width={100}
          height={100}
          className="w-12 h-12 rounded-md inline-block mr-3"
        />
        <span className="min-w-fit text">
          {product.title + " x " + product.quantity}
        </span>
      </div>
      <div className="text-right">
        ৳{(product.discount * product.quantity).toFixed(2)}
      </div>
    </div>
  );
}
