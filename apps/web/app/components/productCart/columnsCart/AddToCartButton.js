"use client";

import { useCartContext } from "@/app/context/cartContext";
import { useRouter } from "next/navigation";

import { PiShoppingCartSimple } from "react-icons/pi";

import { toast } from "react-toastify";

// import lucide icon
import { ShoppingCart } from "lucide-react";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { StopCircle } from "lucide-react";
import { BsDoorClosed, BsStop } from "react-icons/bs";
import { DoorClosed } from "lucide-react";
import { CircleParking } from "lucide-react";
import { CircleX } from "lucide-react";

function AddToCartButton({
  productData,
  wishlist,
  removeFromWishlist,
  productD,
}) {
  const { addToCart, cart } = useCartContext();
  const router = useRouter();
  const isProductInCart = cart.some((product) => product.id === productData.id);

  const handleAddToCart = () => {
    const {
      stock,
      id,
      title,
      image,
      purchase_price,
      discount,
      regular_price,
      quantity,
      manufacturer_name,
      name,
      generic_name,
    } = productData;

    addToCart({
      stock,
      id,
      title,
      image,
      purchase_price,
      discount,
      regular_price,
      quantity: 1,
      manufacturer_name,
      name,
      generic_name,
    });

    toast.success(`${title} added to cart!`);

    // Remove from wishlist if applicable
    if (wishlist && removeFromWishlist) {
      removeFromWishlist(productData.id);
      toast.info(`${title} removed from wishlist!`);
    }
  };

  return (
    <>
      {isProductInCart ? (
        <Link href="/cart">
          <button className="w-full h-[40px] flex items-center justify-center gap-2 bg-emerald-500 text-white text-sm md:text-text-customSize  font-semibold rounded-full">
            <span className="mb-1">
              <ShoppingBasket size={20} strokeWidth={1.25} />
            </span>
            <span>View cart</span>
          </button>
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={isProductInCart || productData.stock === 0}
          className={`w-full h-[40px] flex items-center justify-center  gap-2 ${
            productD
              ? productData.stock === 0
                ? "bg-sky-blue/20"
                : "bg-sky-blue"
              : "bg-light-mist  text-deep-sea-blue"
          } text-sm md:text-text-customSize  font-semibold rounded-full`}
        >
          <div className="flex items-center gap-2 ">
            {productData.stock === 0 ? (
              <>
                <CircleX
                  size={20}
                  strokeWidth={1.25}
                  className="text-red-500"
                />
                <span className="text-red-500">Out of Stock</span>
              </>
            ) : (
              <>
                <span className="mb-1">
                  <ShoppingCart size={20} strokeWidth={1.25} cl />
                </span>
                <span>Add to cart</span>
              </>
            )}
          </div>
        </button>
      )}
    </>
  );
}

export default AddToCartButton;
