"use client";

import { CircleMinus, CircleMinusIcon, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const CartCardMobile = () => {
  const [productQuantity, setProductQuantity] = useState(1);

  const handleIncrease = () => {
    setProductQuantity((prev) => prev + 1);
  };
  const handleDecrease = () => {
    setProductQuantity((prev) => prev - 1);
  };

  return (
    <div className="grid grid-cols-12 gap-1 mx-auto mt-30 justify-center items-center border rounded-lg lg:hidden py-2">
      <div className="col-span-1 text-center">
        <button className="rounded-full flex justify-center items-center mx-auto p-1 bg-gray-100 hover:bg-gray-300">
          <X className="h-4 w-4 text-gray-500 " />
        </button>
      </div>
      <div className="col-span-3 flex items-center justify-center">
        <Image
          src={`https://enovathemes.com/propharm/wp-content/uploads/product73.jpg`}
          alt="Pain Away Forte"
          width={70}
          height={70}
          className="rounded-lg "
        />
      </div>
      <div className="col-span-6 text-left">
        <h3 className="font-bold text-[13px] text-[#184363]">
          Pain Away Forte + Arthritis Cream
        </h3>
        <div className="flex justify-start gap-3 items-center">
          <p className="text-[#000000] text-[11px]">Price</p>
          <p className="text-[#000000] text-xs font-semibold">$20.95</p>
        </div>
        <div className="flex justify-start gap-3 items-center">
          <p className="text-[#184363] text-xs">SubTotal</p>
          <p className="text-[#184363] text-[11px] font-semibold">$104.75</p>
        </div>
      </div>

      <div className="col-span-2 flex flex-col justify-center items-center   rounded-md mx-auto w-8 gap-1">
        <button
          onClick={handleDecrease}
          disabled={productQuantity === 1}
          className="bg-gray-200 rounded-full p-[2px]"
        >
          <Minus size={18} strokeWidth={1.5} />
        </button>
        <span className="font-semibold text-[16px]">{productQuantity}</span>
        <button
          onClick={handleIncrease}
          className="bg-gray-200 rounded-full p-[2px]"
        >
          <Plus size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default CartCardMobile;
