"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap, Truck, ShieldCheck, Heart } from "lucide-react";
import { PiHeartFill, PiHeartLight } from "react-icons/pi";
import { useCartContext } from "@/app/context/cartContext";
import { useWishlistContext } from "@/app/context/wishlistContext";
import { toast } from "react-toastify";
import SocialIcons from "@/app/components/SocialIcons";

export default function ShowProductDetails({ product, deliveryZones = [], onSelectImage }) {
  const router = useRouter();
  const { cart, addToCart } = useCartContext();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistContext();

  const id = product?._id || product?.id;
  const variants = Array.isArray(product?.variants) ? product.variants.filter((v) => v.status !== "inactive") : [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);

  // Fallback attributes if no explicit variants configured
  const packSizes = Array.isArray(product?.pack_size) ? product.pack_size : [];
  const colors = Array.isArray(product?.color) ? product.color : [];
  const [selectedPackSize, setSelectedPackSize] = useState(packSizes[0] || null);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);

  // Active pricing and stock (variant overrides base product)
  const regularPrice = Number(
    selectedVariant?.regularPrice || product?.regular_price || 0
  );
  const discountPrice = Number(
    selectedVariant?.discountPrice != null && selectedVariant?.discountPrice > 0
      ? selectedVariant.discountPrice
      : product?.discount_price || 0
  );
  const effectivePrice = discountPrice > 0 && discountPrice < regularPrice ? discountPrice : regularPrice;
  const isDiscounted = discountPrice > 0 && discountPrice < regularPrice;
  const savingsAmount = isDiscounted ? regularPrice - discountPrice : 0;
  const savingsPercent = isDiscounted ? Math.round((savingsAmount / regularPrice) * 100) : 0;

  const currentStock = selectedVariant?.stock != null ? selectedVariant.stock : Number(product?.stock ?? 1);
  const inStock = currentStock > 0;

  // Quantity stepper
  const [quantity, setQuantity] = useState(1);
  const handleIncrease = () => {
    if (quantity < currentStock) setQuantity((prev) => prev + 1);
    else toast.warning(`Only ${currentStock} units available in stock`);
  };
  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Cheapest active delivery zone for estimate box
  const activeZones = deliveryZones.filter((z) => z.status === "active");
  const cheapestZone = activeZones.length > 0
    ? activeZones.reduce((min, z) => (z.charge < min.charge ? z : min), activeZones[0])
    : { label: "Inside Dhaka", charge: 60, eta: "24-48 hours", freeAbove: 1000 };

  const isInWishlist = wishlist.some((item) => String(item.id || item._id) === String(id));
  const isInCart = cart.some(
    (item) => String(item.id || item._id) === String(id) && item.variantSku === selectedVariant?.sku
  );

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(id);
      toast.info(`${product.name} removed from wishlist`);
    } else {
      addToWishlist({
        id,
        _id: id,
        title: product.name,
        name: product.name,
        image: selectedVariant?.image || product?.images?.[0] || "",
        regular_price: regularPrice,
        discount: discountPrice,
        manufacturer_name: product?.manufacturer_name,
        stock: currentStock,
      });
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      id,
      _id: id,
      title: product.name,
      name: product.name,
      image: selectedVariant?.image || product?.images?.[0] || "",
      regular_price: regularPrice,
      discount: discountPrice,
      price: effectivePrice,
      quantity,
      manufacturer_name: product?.manufacturer_name,
      stock: currentStock,
      generic_name: product?.generic_name,
      variantSku: selectedVariant?.sku || null,
      variantLabel: selectedVariant?.label || selectedPackSize || null,
    });
    toast.success(`${product.name} (${quantity}x) added to cart!`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  const handleSelectVariant = (v) => {
    setSelectedVariant(v);
    setQuantity(1);
    if (v.image && onSelectImage) {
      onSelectImage(v.image);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-foreground">
      {/* Title & Category / Manufacturer Meta */}
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {product?.special_tag && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              {product.special_tag}
            </span>
          )}
          {product?.products_type && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
              {product.products_type}
            </span>
          )}
          {inStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60">
              In Stock ({currentStock})
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60">
              Out of Stock
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-snug">
          {product?.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          {product?.generic_name && (
            <p>
              <strong className="text-foreground">Generic:</strong> {product.generic_name}
            </p>
          )}
          {product?.manufacturer_name && (
            <p>
              <strong className="text-foreground">Manufacturer:</strong>{" "}
              <Link
                href={`/shop?brand=${encodeURIComponent(product.manufacturer_name)}`}
                className="text-primary hover:underline"
              >
                {product.manufacturer_name}
              </Link>
            </p>
          )}
          {product?.strength && (
            <p>
              <strong className="text-foreground">Strength:</strong> {product.strength}
            </p>
          )}
        </div>
      </div>

      {/* Authoritative Price Display with Savings */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-baseline justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-black text-foreground">
            ৳{effectivePrice.toLocaleString("en-BD")}
          </span>
          {isDiscounted && (
            <del className="text-sm sm:text-base text-muted-foreground font-medium">
              ৳{regularPrice.toLocaleString("en-BD")}
            </del>
          )}
        </div>

        {isDiscounted && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <span>Save ৳{savingsAmount.toLocaleString("en-BD")}</span>
            <span>({savingsPercent}% OFF)</span>
          </div>
        )}
      </div>

      {/* Variant Selector (if variants exist) */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Select Option / Pack Size:</span>
            {selectedVariant && (
              <span className="text-foreground font-semibold lowercase">
                {selectedVariant.label || selectedVariant.sku}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = selectedVariant?.sku === v.sku;
              return (
                <button
                  key={v.sku || idx}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <span>{v.label || v.sku}</span>
                  {v.discountPrice > 0 && v.discountPrice < v.regularPrice ? (
                    <span className="ml-1.5 opacity-80">৳{v.discountPrice}</span>
                  ) : v.regularPrice > 0 ? (
                    <span className="ml-1.5 opacity-80">৳{v.regularPrice}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback Pack Size Chips (if no SKU variants but pack_size array exists) */}
      {variants.length === 0 && packSizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pack Size:
          </label>
          <div className="flex flex-wrap gap-2">
            {packSizes.map((size, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPackSize(size)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedPackSize === size
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Stepper & Cart / Buy Now Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Quantity Stepper with Stock Limit */}
          <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1 || !inStock}
              aria-label="Decrease quantity"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center text-sm font-bold text-foreground">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= currentStock || !inStock}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex-1 h-11 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              inStock
                ? isInCart
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={16} />
            <span>{inStock ? (isInCart ? "Add Another to Cart" : "Add to Cart") : "Out of Stock"}</span>
          </button>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="w-11 h-11 rounded-xl border border-border bg-card flex items-center justify-center text-foreground hover:border-primary/50 transition-colors shrink-0 shadow-sm"
          >
            {isInWishlist ? (
              <PiHeartFill className="text-rose-500 text-xl" />
            ) : (
              <PiHeartLight className="text-muted-foreground hover:text-rose-500 text-xl transition-colors" />
            )}
          </button>
        </div>

        {/* Buy Now Button */}
        {inStock && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full h-11 px-6 rounded-xl bg-sunset-orange hover:bg-sunset-orange/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Zap size={16} />
            <span>Buy Now (Instant Checkout)</span>
          </button>
        )}
      </div>

      {/* Delivery Estimate Box */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Truck size={16} className="text-primary" />
          <span>Delivery Estimate:</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">{cheapestZone.label}:</strong> ৳{cheapestZone.charge}{" "}
          ({cheapestZone.eta || "24-48 hours"}).
          {cheapestZone.freeAbove ? ` Free delivery on orders over ৳${cheapestZone.freeAbove}.` : ""}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>100% Genuine Medicine Guaranteed | Cash on Delivery Available</span>
        </div>
      </div>

      {/* Ask about product Consultation Link */}
      <div className="flex items-center justify-between text-xs pt-1">
        <Link
          href="/consultation/doctor"
          className="text-primary hover:underline font-semibold flex items-center gap-1.5"
        >
          <span>Need a doctor&apos;s prescription? Consult online</span>
        </Link>
      </div>

      {/* Social Share Icons */}
      <div className="pt-2 border-t border-border/60">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
          Share this product:
        </span>
        <SocialIcons
          socialLinks={{
            title: product?.name,
            des: product?.short_description,
            image: product?.images?.[0],
            url: typeof window !== "undefined" ? window.location.href : "",
          }}
          product={product}
        />
      </div>
    </div>
  );
}
