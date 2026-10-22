"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartContext } from "@/app/context/cartContext";
import {
  Trash2,
  Minus,
  Plus,
  AlertTriangle,
  Tag,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

export default function CartPage() {
  const { cart, setDecrement, setIncrement, removeCart } = useCartContext();

  // Server re-pricing state
  const [pricedItems, setPricedItems] = useState(null);
  const [isPricing, setIsPricing] = useState(false);
  const [hasPriceChanged, setHasPriceChanged] = useState(false);
  const [serverTotals, setServerTotals] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Re-price cart whenever cart items or quantities change
  useEffect(() => {
    if (!cart || cart.length === 0) {
      setPricedItems([]);
      setServerTotals(null);
      setHasPriceChanged(false);
      return;
    }

    let isMounted = true;
    const fetchCartPricing = async () => {
      setIsPricing(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const payloadItems = cart.map((item) => ({
          id: item.id || item._id,
          quantity: item.quantity || 1,
          clientPrice: Number(item.price || item.discount || item.regular_price || 0),
        }));

        const res = await fetch(`${apiUrl}/api/cart/price`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: payloadItems,
            couponCode: appliedCoupon?.code || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.success) {
            setPricedItems(data.items || []);
            setServerTotals(data);

            // Check if any item's price changed from client stored price
            const anyChanged = (data.items || []).some(
              (pItem) => pItem.priceChanged || pItem.changed
            );
            if (anyChanged) {
              setHasPriceChanged(true);
            }
          }
        }
      } catch (err) {
        console.error("Cart price preview error:", err);
      } finally {
        if (isMounted) setIsPricing(false);
      }
    };

    fetchCartPricing();
    return () => {
      isMounted = false;
    };
  }, [cart, appliedCoupon]);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const payloadItems = cart.map((item) => ({
        id: item.id || item._id,
        quantity: item.quantity || 1,
      }));

      const res = await fetch(`${apiUrl}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          items: payloadItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || "Invalid coupon code");
      }

      setAppliedCoupon(data);
      toast.success(`Coupon ${data.code} applied! Saved ৳${data.discount}`);
      setCouponCode("");
    } catch (err) {
      setCouponError(err.message || "Failed to apply coupon");
      toast.error(err.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    toast.info("Coupon removed");
  };

  // Calculate local subtotal fallback
  const localSubtotal = cart.reduce((acc, p) => {
    const pId = p.id || p._id;
    const serverP = pricedItems?.find((it) => String(it.id) === String(pId));
    const effectiveUnitPrice = serverP?.price != null ? serverP.price : Number(p.price || p.discount || p.regular_price || 0);
    return acc + effectiveUnitPrice * (p.quantity || 1);
  }, 0);

  const subtotal = serverTotals?.subtotal != null ? serverTotals.subtotal : localSubtotal;
  const couponDiscount = appliedCoupon?.discount || 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount);

  // Check if any items are out of stock
  const outOfStockItems = pricedItems?.filter((it) => it.inStock === false) || [];

  return (
    <div className="container mx-auto px-3 lg:px-6 py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Shopping Cart ({cart.length} items)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Review your medicines and healthcare supplies before checkout
        </p>
      </div>

      {/* Notice: Price Updated */}
      {hasPriceChanged && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold">Catalog Price Update Notice:</strong>
            <p className="mt-0.5">
              One or more item prices have been updated to reflect the authoritative live catalog.
            </p>
          </div>
        </div>
      )}

      {/* Notice: Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="text-xs sm:text-sm flex-1">
            <strong className="font-bold">Attention Needed:</strong>
            <p className="mt-0.5">
              Some items in your cart are currently out of stock. Please remove them to proceed with checkout.
            </p>
          </div>
        </div>
      )}

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Table (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 p-4 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="col-span-6">Product Details</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Subtotal</span>
            </div>

            {cart.map((product) => {
              const pId = product.id || product._id;
              const serverInfo = pricedItems?.find((it) => String(it.id) === String(pId));
              const unitPrice = serverInfo?.price != null ? serverInfo.price : Number(product.price || product.discount || product.regular_price || 0);
              const isOutOfStock = serverInfo?.inStock === false;
              const itemTotal = unitPrice * (product.quantity || 1);

              return (
                <div
                  key={pId}
                  className={`p-4 md:p-5 flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-colors ${
                    isOutOfStock ? "bg-rose-500/5" : "hover:bg-muted/30"
                  }`}
                >
                  {/* Product Info (Col 6) */}
                  <div className="w-full md:col-span-6 flex items-center gap-3">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted/40 border border-border/80 shrink-0 flex items-center justify-center p-1">
                      <Image
                        src={product.image || "/assets/banner/01.jpg"}
                        alt={product.name || product.title}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {product.manufacturer_name && (
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground truncate">
                          {product.manufacturer_name}
                        </p>
                      )}
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
                        <Link href={`/product/${product.slug || pId}`}>
                          {product.name || product.title}
                        </Link>
                      </h4>
                      {product.variantLabel && (
                        <p className="text-[11px] text-muted-foreground">
                          Option: {product.variantLabel}
                        </p>
                      )}
                      {isOutOfStock && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price (Col 2) */}
                  <div className="w-full md:col-span-2 flex justify-between md:justify-center items-center text-xs sm:text-sm">
                    <span className="md:hidden text-muted-foreground">Price:</span>
                    <span className="font-bold text-foreground">
                      ৳{unitPrice.toLocaleString("en-BD")}
                    </span>
                  </div>

                  {/* Quantity Stepper (Col 2) */}
                  <div className="w-full md:col-span-2 flex justify-between md:justify-center items-center">
                    <span className="md:hidden text-muted-foreground text-xs">Quantity:</span>
                    <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
                      <button
                        type="button"
                        onClick={() => setDecrement(pId)}
                        disabled={product.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-foreground">
                        {product.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIncrement(pId)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Remove (Col 2) */}
                  <div className="w-full md:col-span-2 flex justify-between md:justify-end items-center gap-3">
                    <div className="flex items-center gap-1.5 md:hidden text-xs">
                      <span className="text-muted-foreground">Subtotal:</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      ৳{itemTotal.toLocaleString("en-BD")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCart(pId)}
                      aria-label="Remove item"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Totals & Coupon Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Box */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag size={14} className="text-primary" />
                <span>Have a Coupon / Promo Code?</span>
              </h3>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={14} />
                      <span>{appliedCoupon.code}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Discount applied: ৳{appliedCoupon.discount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HEALTH100"
                    className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {validatingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {couponError}
                </p>
              )}
            </div>

            {/* Order Summary Box */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground pb-3 border-b border-border">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ৳{subtotal.toLocaleString("en-BD")}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Coupon Discount</span>
                    <span>-৳{couponDiscount.toLocaleString("en-BD")}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Delivery</span>
                  <span className="text-[11px]">Calculated at checkout</span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-xl sm:text-2xl font-black text-foreground">
                    ৳{finalTotal.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              {outOfStockItems.length > 0 ? (
                <button
                  type="button"
                  disabled
                  className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-bold text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} />
                  <span>Remove Out-of-Stock Items</span>
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full h-12 rounded-xl bg-sunset-orange hover:bg-sunset-orange/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <Link
                href="/shop"
                className="block text-center text-xs font-semibold text-primary hover:underline pt-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-20 px-4 rounded-3xl border border-border bg-card shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Tag size={28} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
            Looks like you haven&apos;t added any medicines or health products to your cart yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Explore Medicines</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
