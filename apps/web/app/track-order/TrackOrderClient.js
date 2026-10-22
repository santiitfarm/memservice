"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  MapPin,
  CreditCard,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function TrackOrderClient({ initialOrderNumber = "", initialPhone = "" }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (orderNumToSearch, phoneToSearch) => {
    if (!orderNumToSearch || !phoneToSearch) {
      setErrorMsg("Please enter both your Order Number and Mobile Phone Number.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/orders/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumToSearch.trim(),
          phone: phoneToSearch.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Order not found. Please verify your order number and phone.");
      }

      setTrackingData(data.tracking || null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to track order.");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      handleTrack(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack(orderNumber, phone);
  };

  const handleCopy = (text) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Search Input Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. MS-241210-000001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Track</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Top Status Header */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Order Tracking Details
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-foreground">
                    {trackingData.orderNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(trackingData.orderNumber)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    title="Copy Order Number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {trackingData.orderDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on: {new Date(trackingData.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Status: {trackingData.status}
                </span>
              </div>
            </div>

            {/* Visual Order Timeline */}
            <div className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(trackingData.timeline || [
                  { stage: "placed", label: "Order Placed", completed: true },
                  { stage: "confirmed", label: "Order Confirmed", completed: trackingData.status !== "placed" },
                  { stage: "shipped", label: "Shipped with Courier", completed: ["shipped", "delivered"].includes(trackingData.status) },
                  { stage: "delivered", label: "Delivered", completed: trackingData.status === "delivered" },
                ]).map((step, idx) => {
                  const isDone = step.completed;
                  return (
                    <div
                      key={step.stage || idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                          : "bg-muted/40 border-border text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Step {idx + 1}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground/60" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{step.label}</h4>
                        {step.timestamp && (
                          <p className="text-[11px] opacity-75 mt-0.5">
                            {new Date(step.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Courier Tracking Banner */}
            {trackingData.shipment?.trackingCode && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Courier Dispatch: {trackingData.shipment.courier || "Assigned"}
                    </h4>
                    <p className="text-sm font-bold font-mono text-foreground">
                      Tracking Code: {trackingData.shipment.trackingCode}
                    </p>
                  </div>
                </div>

                {trackingData.shipment.trackingUrl && (
                  <a
                    href={trackingData.shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Track Live on Courier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Items & Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span>Ordered Items ({trackingData.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-border">
                {trackingData.items?.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: <strong>{item.quantity}</strong> × ৳{Number(item.price || 0).toLocaleString("en-BD")}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-foreground shrink-0">
                      ৳{Number(item.total || (item.price * item.quantity) || 0).toLocaleString("en-BD")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Delivery Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground mb-4">Payment & Totals</h3>

                {/* Totals Breakdown */}
                <div className="space-y-2 text-xs text-muted-foreground pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ৳{Number(trackingData.totals?.subtotal || 0).toLocaleString("en-BD")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge:</span>
                    <span className="font-medium text-foreground">
                      ৳{Number(trackingData.totals?.deliveryCharge || 0).toLocaleString("en-BD")}
                    </span>
                  </div>
                  {Number(trackingData.totals?.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount:</span>
                      <span>-৳{Number(trackingData.totals?.discount).toLocaleString("en-BD")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary text-base">
                      ৳{Number(trackingData.totals?.totalAmount || 0).toLocaleString("en-BD")}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      <span>Payment Method:</span>
                    </span>
                    <span className="font-bold uppercase text-foreground">
                      {trackingData.payment?.method || "COD"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      trackingData.payment?.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {trackingData.payment?.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                {trackingData.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Delivery Address:</span>
                        <p className="mt-0.5">
                          {trackingData.shippingAddress.address || trackingData.shippingAddress.street}
                          {trackingData.shippingAddress.city ? `, ${trackingData.shippingAddress.city}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <Link
                  href="/shop"
                  className="w-full py-2.5 rounded-xl border border-border text-center text-xs font-semibold text-foreground hover:bg-muted transition block"
                >
                  Continue Shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
