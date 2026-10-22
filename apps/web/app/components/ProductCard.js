"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import { toast } from "react-toastify";
import { PiHeartLight, PiHeartFill } from "react-icons/pi";

export default function ProductCard({ product }) {
  const { cart = [], addToCart } = useCartContext();
  const { wishlist = [], addToWishlist, removeFromWishlist } = useWishlistContext();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const id = product.id || product._id;
  const slug = product.slug || id;
  const name = product.name || product.title || "Product";
  const manufacturer = product.manufacturer_name || product.manufacturer || product.brand?.title || "";

  // Images: primary and secondary hover image
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || "/assets/banner/01.jpg"];

  const primaryImage = images[0] || "/assets/banner/01.jpg";
  const hoverImage = images.length > 1 ? images[1] : null;

  // Prices in BDT (Numbers)
  const regularPrice = Number(product.regular_price || product.oldPrice || 0);
  const discountPrice = Number(product.discount_price || product.currentPrice || 0);
  const effectivePrice = discountPrice > 0 ? discountPrice : regularPrice;
  const isDiscounted = discountPrice > 0 && discountPrice < regularPrice;

  // Discount percentage calculation
  const discountPercent = isDiscounted
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100)
    : Number(product.discount || 0);

  // Stock & rating
  const inStock = (product.stock ?? 1) > 0;
  const rating = Number(product.avgRating || 4.8).toFixed(1);
  const reviewCount = product.reviewCount || 12;

  // Cart & Wishlist state
  const isInCart = cart.some((item) => String(item.id || item._id) === String(id));
  const isInWishlist = wishlist.some((item) => String(item.id || item._id) === String(id));

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      removeFromWishlist(id);
      toast.info(`${name} removed from wishlist`);
    } else {
      addToWishlist({
        id,
        _id: id,
        title: name,
        name,
        image: primaryImage,
        regular_price: regularPrice,
        discount: discountPrice,
        manufacturer_name: manufacturer,
        stock: product.stock,
      });
      toast.success(`${name} added to wishlist!`);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) return;

    addToCart({
      id,
      _id: id,
      title: name,
      name,
      image: primaryImage,
      regular_price: regularPrice,
      discount: discountPrice,
      quantity: 1,
      manufacturer_name: manufacturer,
      stock: product.stock,
      generic_name: product.generic_name,
    });

    toast.success(`${name} added to cart!`);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-card p-3 sm:p-4 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50"
    >
      {/* Top badges: Discount & Wishlist */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/30 mb-3 flex items-center justify-center">
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-sunset-orange text-white text-[11px] font-bold shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-card/80 hover:bg-card text-foreground flex items-center justify-center shadow-md backdrop-blur-sm transition-transform hover:scale-110"
        >
          {isInWishlist ? (
            <PiHeartFill className="text-rose-500 text-lg" />
          ) : (
            <PiHeartLight className="text-muted-foreground hover:text-rose-500 text-lg transition-colors" />
          )}
        </button>

        {/* Product Image with Hover Secondary Image Swap */}
        <Link href={`/product/${slug}`} className="w-full h-full relative block">
          <Image
            src={primaryImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className={`object-contain p-2 transition-all duration-500 ${
              isHovered && hoverImage ? "opacity-0 scale-95" : "opacity-100 scale-100 group-hover:scale-105"
            }`}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${name} preview`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
              className={`object-contain p-2 transition-all duration-500 absolute inset-0 ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
              }`}
            />
          )}
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Manufacturer / Generic Name */}
          {manufacturer && (
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate mb-1">
              <Link href={`/shop?brand=${encodeURIComponent(manufacturer)}`} className="hover:text-primary transition-colors">
                {manufacturer}
              </Link>
            </p>
          )}

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            <Link href={`/product/${slug}`}>{name}</Link>
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-foreground">{rating}</span>
            <span className="text-[11px] text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        {/* Pricing and Add to Cart Section */}
        <div className="mt-2 pt-2 border-t border-border/60">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base sm:text-lg font-bold text-foreground">
              ৳{effectivePrice.toLocaleString("en-BD")}
            </span>
            {isDiscounted && (
              <del className="text-xs text-muted-foreground">
                ৳{regularPrice.toLocaleString("en-BD")}
              </del>
            )}
          </div>

          {/* Add to Cart Button */}
          {inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isInCart
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
              }`}
            >
              {isInCart ? (
                <>
                  <Check size={14} />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-muted text-muted-foreground cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
