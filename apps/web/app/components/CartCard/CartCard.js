"use client";

import { useCartContext } from "@/app/context/cartContext";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartCard({ product }) {
  const { setIncrement, setDecrement, removeCart } = useCartContext();

  const subtotal = (product.discount * product.quantity).toFixed(2);

  const handleIncrease = () => {
    setIncrement(product.id);
  };

  const handleDecrease = () => {
    setDecrement(product.id);
  };

  const handleRemove = () => {
    removeCart(product.id);
  };

  return (
    <div className="relative w-full flex flex-col md:flex-row gap-6 justify-between items-center text-center border-b border-dashed border-gray-200 hover:bg-slate-400/10 duration-300 px-3 md:px-6 py-4 text-deep-sea-blue">
      {/* LEFT DATA */}
      <div className="flex flex-col md:flex-row items-center space-x-12">
        <div className="text-center absolute top-3 right-3 md:relative">
          <button
            onClick={handleRemove}
            className="rounded-full p-1 bg-light-mist hover:bg-deep-sea-blue text-deep-sea-blue hover:text-white transition-all duration-300"
          >
            <X className="p-1" />
          </button>
        </div>

        <Image
          src={product?.image}
          alt={product?.title}
          width={100}
          height={100}
          className="bg-soft-lavender object-cover w-16 h-16  rounded-lg"
        />

        <p className="hidden md:block text-sm min-w-20 font-semibold hover:underline ">
          <Link href={`/product/${product.id}`}>{product.title}</Link>
        </p>
      </div>
      {/* RIGHT DATA */}
      <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center space-x-0 space-y-4 md:space-y-0 md:space-x-32">
        <p className="w-full flex justify-between font-semibold text-sm  md:hidden border-t border-light-mist pt-4">
          <span>Product:</span>
          <span>{product.title}</span>
        </p>
        <p className="w-full font-semibold text-sm flex justify-between items-center border-t border-light-mist pt-4">
          <span className="block md:hidden">Price:</span>
          <span>৳{product.discount}</span>
        </p>
        <div className="w-full flex flex-row text-sm  font-semibold justify-between items-center mx-auto gap-4  border-light-mist pt-4">
          <p className="block md:hidden">Quantity:</p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDecrease}
              disabled={product.quantity === 1}
              className=" bg-light-mist hover:bg-deep-sea-blue text-deep-sea-blue hover:text-white rounded-full p-1"
            >
              <Minus size={20} strokeWidth={1.5} />
            </button>
            <span className="font-semibold">{product.quantity}</span>
            <button
              onClick={handleIncrease}
              className="bg-light-mist hover:bg-deep-sea-blue text-deep-sea-blue hover:text-white rounded-full p-1"
            >
              <Plus size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <p className="w-full font-semibold text-sm flex justify-between items-center  pt-4">
          <span className="block md:hidden">Subtotal:</span>
          <span>৳{subtotal}</span>
        </p>
      </div>
    </div>
  );
}
