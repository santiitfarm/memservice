"use client";

import { useState } from "react";

export default function IncrementDecrementButton() {
  const initialQuantity = 1;
  const minQuantity = 1;
  const maxQuantity = 99;
  const [quantity, setQuantity] = useState(initialQuantity);

  const increment = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const decrement = () => {
    if (quantity > minQuantity) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={decrement}
        disabled={quantity <= minQuantity}
        aria-label="Decrease quantity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>
      <div className="px-3 py-2 bg-white">
        <span className="text-lg font-semibold">{quantity}</span>
      </div>
      <button
        className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={increment}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>
    </div>
  );
}
