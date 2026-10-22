"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartContext } from "@/app/context/cartContext";
import {
  Truck,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";

export default function CheckoutForm({ product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, removeCart } = useCartContext();

  // Buy Now product or Cart products
  const products = product ? JSON.parse(product) : cart;
  const productList = Array.isArray(products) ? products : [products];

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Auto-fill from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.customer_name) setCustomerName(session.user.customer_name);
      if (session.user.phone_number) setPhoneNumber(session.user.phone_number);
      if (session.user.email) setEmail(session.user.email);
      if (session.user.address) setAddress(session.user.address);
    }
  }, [session]);

  // Delivery Zones state
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedZoneKey, setSelectedZoneKey] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [trxId, setTrxId] = useState("");
  const [mfsPhone, setMfsPhone] = useState("");

  // Submission & Error handling
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [priceChangeDialog, setPriceChangeDialog] = useState(null);

  // Initial Load: Fetch Delivery Zones & Public Config (Payment Methods)
  useEffect(() => {
    const fetchCheckoutConfig = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const [zonesRes, configRes] = await Promise.all([
          fetch(`${apiUrl}/api/delivery/zones`),
          fetch(`${apiUrl}/api/public/config`),
        ]);

        if (zonesRes.ok) {
          const zData = await zonesRes.json();
          const activeZ = (zData?.zones || []).filter((z) => z.status === "active");
          setDeliveryZones(activeZ);
          if (activeZ.length > 0) {
            const defZone = activeZ.find((z) => z.isDefault) || activeZ[0];
            setSelectedZoneKey(defZone.key);
          }
        }

        if (configRes.ok) {
          const cData = await configRes.json();
          const pMethods = cData?.config?.paymentMethods || [
            { key: "cod", name: "Cash on Delivery", mode: "live" },
          ];
          setPaymentMethods(pMethods);
        }
      } catch (err) {
        console.error("Failed to load checkout config:", err);
      }
    };

    fetchCheckoutConfig();
  }, []);

  // Calculate items subtotal
  const subtotal = productList.reduce((acc, p) => {
    const price = Number(p.price || p.discount || p.regular_price || 0);
    return acc + price * (p.quantity || 1);
  }, 0);

  // Selected Zone object
  const activeZone = deliveryZones.find((z) => z.key === selectedZoneKey);

  // Fetch Delivery Quote whenever zone, district, area, or subtotal changes
  useEffect(() => {
    if (!selectedZoneKey || subtotal <= 0) return;

    let isMounted = true;
    const fetchQuote = async () => {
      setIsQuoteLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/delivery/quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zoneKey: selectedZoneKey,
            subtotal,
            paymentMethod: selectedPayment,
            district: selectedDistrict,
            area: selectedArea,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.success) {
            setDeliveryQuote(data.quote);

            // If current payment method is COD but zone forbids it, switch to online payment
            if (selectedPayment === "cod" && data.quote.codAvailable === false) {
              const nonCod = paymentMethods.find((pm) => pm.key !== "cod");
              if (nonCod) {
                setSelectedPayment(nonCod.key);
                toast.warning(`Cash on delivery is not available for ${data.quote.zoneLabel}. Switched to ${nonCod.name}.`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Delivery quote error:", err);
      } finally {
        if (isMounted) setIsQuoteLoading(false);
      }
    };

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [selectedZoneKey, selectedDistrict, selectedArea, subtotal, selectedPayment, paymentMethods]);

  // Delivery charge from live quote or zone default
  const deliveryCharge = deliveryQuote?.charge != null ? deliveryQuote.charge : (activeZone?.charge || 60);
  const totalAmount = Math.max(0, subtotal + deliveryCharge);

  // COD availability in current zone
  const isCodAllowed = deliveryQuote?.codAvailable !== false && activeZone?.codAvailable !== false;

  // Submit Order with Idempotency Key
  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    // Basic validation
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      setErrorMsg("Please fill in your name, contact phone number, and delivery address.");
      toast.error("Please fill in all required customer fields.");
      return;
    }

    if (!selectedZoneKey) {
      setErrorMsg("Please select a delivery zone.");
      return;
    }

    if (selectedPayment === "cod" && !isCodAllowed) {
      setErrorMsg("Cash on Delivery is unavailable for your selected area. Please choose an online payment method.");
      return;
    }

    setSubmitting(true);

    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ms-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const submissionData = {
      customer: {
        customer_name: customerName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
      },
      payment_info: {
        method: selectedPayment,
        provider: selectedPayment,
        amount: totalAmount,
        transactionId: trxId.trim() || undefined,
        transactionPhone: mfsPhone.trim() || undefined,
      },
      shipping_details: {
        zoneKey: selectedZoneKey,
        zoneLabel: deliveryQuote?.zoneLabel || activeZone?.label || selectedZoneKey,
        district: selectedDistrict || undefined,
        area: selectedArea || undefined,
        address: address.trim(),
        shipping_charge: deliveryCharge,
        instructions: orderNotes.trim() || undefined,
      },
      total_amount: totalAmount,
      items: productList.map((p) => {
        const unitPrice = Number(p.price || p.discount || p.regular_price || 0);
        return {
          id: p.id || p._id,
          title: p.name || p.title,
          quantity: p.quantity || 1,
          price: unitPrice,
          variantSku: p.variantSku || undefined,
        };
      }),
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      // Handle 409 PRICE_CHANGED
      if (res.status === 409 && data.code === "PRICE_CHANGED") {
        setSubmitting(false);
        setPriceChangeDialog({
          message: data.message || "Product prices or delivery rates have been updated.",
          total: data.total,
          updatedItems: data.cart || [],
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // Clear purchased items from cart
      productList.forEach((item) => {
        removeCart(item.id || item._id);
      });

      // If online payment has redirect URL, send user to payment gateway
      if (selectedPayment !== "cod" && data.payment_url) {
        toast.info("Redirecting to secure payment gateway...");
        window.location.href = data.payment_url;
      } else {
        // COD / Direct confirmation
        toast.success("Order placed successfully!");
        const orderId = data.order?._id || data.order?.id;
        router.push(`/complete-order?orderId=${orderId}&order_id=${orderId}`);
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      toast.error(err.message || "Failed to place order.");
    }
  };

  if (!productList || productList.length === 0) {
    return (
      <div className="text-center py-20 px-4 rounded-3xl border border-border bg-card max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-foreground">No Items to Checkout</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your cart is empty. Please add medicines or health products before checking out.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
        >
          <span>Return to Shop</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Price Change Confirmation Dialog */}
      {priceChangeDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-foreground">Prices Updated</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {priceChangeDialog.message}
            </p>
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span>Updated Order Total:</span>
                <span className="font-bold text-foreground text-sm">
                  ৳{priceChangeDialog.total?.toLocaleString("en-BD")}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPriceChangeDialog(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Review Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriceChangeDialog(null);
                  handleSubmitOrder();
                }}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Accept & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Customer Info, Delivery Zone & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact & Shipping Address */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h2 className="font-bold text-base text-foreground">
                  Delivery Address & Contact
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 01711655686"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Email Address (Optional for invoice)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Street Address / House / Flat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House #12, Road #4, Sector #3, Uttara, Dhaka"
                      className="w-full p-2.5 pl-9 rounded-xl border border-border bg-muted/30 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Dynamic Delivery Zone Selector & Quote */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Truck size={18} className="text-primary" />
                  <span>Delivery Area & Method</span>
                </h2>
              </div>

              {/* Delivery Zone Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deliveryZones.map((zone) => {
                  const isSelected = selectedZoneKey === zone.key;
                  return (
                    <label
                      key={zone.key}
                      onClick={() => setSelectedZoneKey(zone.key)}
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 bg-muted/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryZone"
                        checked={isSelected}
                        onChange={() => setSelectedZoneKey(zone.key)}
                        className="mt-0.5 text-primary focus:ring-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {zone.label}
                          </span>
                          <span className="text-xs font-extrabold text-primary">
                            ৳{zone.charge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          ETA: {zone.eta || "24-48 hours"}
                        </p>
                        {zone.freeAbove && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                            Free over ৳{zone.freeAbove}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* District & Area Coverage Dropdown (when zone specifies coverage) */}
              {activeZone?.coverage?.districts?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      District:
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="">Select District</option>
                      {activeZone.coverage.districts.map((d, i) => (
                        <option key={i} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeZone?.coverage?.areas?.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Thana / Area:
                      </label>
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value="">Select Area</option>
                        {activeZone.coverage.areas.map((a, i) => (
                          <option key={i} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Free Delivery Indicator */}
              {deliveryQuote?.amountNeededForFree > 0 && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center gap-2 text-primary">
                  <Sparkles size={15} />
                  <span>
                    Add <strong>৳{deliveryQuote.amountNeededForFree.toLocaleString("en-BD")}</strong> more
                    to your cart for <strong>FREE Delivery</strong>!
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method Selection */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  <span>Payment Method</span>
                </h2>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((pm) => {
                  const isSelected = selectedPayment === pm.key;
                  const isCod = pm.key === "cod";
                  const isDisabled = isCod && !isCodAllowed;

                  return (
                    <label
                      key={pm.key}
                      onClick={() => !isDisabled && setSelectedPayment(pm.key)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed bg-muted/40 border-border"
                          : isSelected
                          ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                          : "border-border hover:border-primary/40 bg-muted/20 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.key}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setSelectedPayment(pm.key)}
                        className="text-primary focus:ring-primary"
                      />

                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {pm.key === "bkash" && (
                          <Image
                            src="/assets/logo/bkash.png"
                            alt="bKash"
                            width={40}
                            height={24}
                            className="h-5 w-auto object-contain"
                          />
                        )}
                        {pm.key === "nagad" && (
                          <Image
                            src="/assets/logo/nagad.png"
                            alt="Nagad"
                            width={40}
                            height={24}
                            className="h-5 w-auto object-contain"
                          />
                        )}
                        <span className="text-xs font-bold text-foreground truncate">
                          {pm.name}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* COD unavailable warning */}
              {selectedPayment === "cod" && !isCodAllowed && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>
                    Cash on Delivery is unavailable in {activeZone?.label || "this zone"}. Please choose an online payment method.
                  </span>
                </div>
              )}

              {/* Manual MFS details box (if manual_mfs selected) */}
              {selectedPayment === "manual_mfs" && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Manual MFS Payment Instructions
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please Send Money to our official MFS account: <strong>+8801711655686</strong> and enter your TrxID below for manual verification.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Your Sender MFS Number:
                      </label>
                      <input
                        type="tel"
                        value={mfsPhone}
                        onChange={(e) => setMfsPhone(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Transaction ID (TrxID):
                      </label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="e.g. 9J4K8L9M"
                        className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Order Summary & Submit Button */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-5">
              <h3 className="font-bold text-base text-foreground pb-3 border-b border-border">
                Order Review ({productList.length} items)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {productList.map((prod, idx) => {
                  const pId = prod.id || prod._id;
                  const price = Number(prod.price || prod.discount || prod.regular_price || 0);
                  const itemTotal = price * (prod.quantity || 1);

                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted/40 p-1 border border-border shrink-0 relative flex items-center justify-center">
                          <Image
                            src={prod.image || "/assets/banner/01.jpg"}
                            alt={prod.name || prod.title}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {prod.name || prod.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {prod.quantity || 1} &times; ৳{price}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground shrink-0">
                        ৳{itemTotal.toLocaleString("en-BD")}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ৳{subtotal.toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span>Delivery ({activeZone?.label || "Selected Zone"}):</span>
                    {isQuoteLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                  </span>
                  <span className="font-semibold text-foreground">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `৳${deliveryCharge.toLocaleString("en-BD")}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-foreground">Total Payable</span>
                  <span className="text-2xl font-black text-foreground">
                    ৳{totalAmount.toLocaleString("en-BD")}
                  </span>
                </div>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Order Action */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-sunset-orange hover:bg-sunset-orange/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Order...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      {selectedPayment === "cod" ? "Place Order (Cash on Delivery)" : "Proceed to Payment"}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center pt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>256-Bit SSL Encrypted & 100% Genuine Medicine</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
