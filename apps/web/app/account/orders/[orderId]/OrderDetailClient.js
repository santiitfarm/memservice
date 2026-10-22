"use client";

import { useState } from "react";
import Link from "next/link";
import Print from "./Print";
import ReturnRequestModal from "./ReturnRequestModal";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
  RotateCcw,
  ArrowLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function OrderDetailClient({ order }) {
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnRequested, setReturnRequested] = useState(false);

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
        <Link href="/account" className="mt-4 text-primary underline text-sm">
          Back to Account
        </Link>
      </div>
    );
  }

  // Calculate return window (7 days after deliveryDate or updatedAt)
  const isDelivered = order.status === "delivered";
  const deliveredAt = order.delivery_date ? new Date(order.delivery_date) : new Date(order.updatedAt || order.createdAt);
  const returnWindowExpiry = new Date(deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isReturnEligible = isDelivered && new Date() <= returnWindowExpiry;

  const timeline = [
    { stage: "placed", label: "Order Placed", completed: true },
    { stage: "confirmed", label: "Order Confirmed", completed: order.status !== "placed" },
    { stage: "shipped", label: "Shipped with Courier", completed: ["shipped", "delivered"].includes(order.status) },
    { stage: "delivered", label: "Delivered", completed: order.status === "delivered" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Order Details
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {order.status}
            </span>

            <Print orderData={order} />

            {isReturnEligible && !returnRequested && (
              <button
                type="button"
                onClick={() => setReturnModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 font-bold text-xs inline-flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Return</span>
              </button>
            )}

            {returnRequested && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Return Requested</span>
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  step.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Step {idx + 1}</span>
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground/60" />
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold">{step.label}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Live Courier Tracking Link */}
        {order.shipment?.trackingCode && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-background to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Courier Shipment ({order.shipment.courier || "Assigned"})
                </h4>
                <p className="text-sm font-bold font-mono text-foreground">
                  Tracking Code: {order.shipment.trackingCode}
                </p>
              </div>
            </div>

            {order.shipment.trackingUrl && (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Live Courier Tracking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Items & Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordered items */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span>Items in this Order ({order.items?.length || 0})</span>
          </h3>

          <div className="divide-y divide-border">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: <strong>{item.quantity}</strong> × ৳{Number(item.unit_price || 0).toLocaleString("en-BD")}
                  </p>
                </div>
                <span className="font-bold text-sm text-foreground shrink-0">
                  ৳{Number(item.subtotal || item.unit_price * item.quantity || 0).toLocaleString("en-BD")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Address */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">Payment & Summary</h3>

            <div className="space-y-2 text-xs text-muted-foreground pb-4 border-b border-border">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-foreground">
                  ৳{Number(order.subtotal || order.total_amount - (order.shipping_charge || 0) + (order.discount_amount || 0)).toLocaleString("en-BD")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-medium text-foreground">
                  ৳{Number(order.shipping_charge || 0).toLocaleString("en-BD")}
                </span>
              </div>
              {Number(order.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span>-৳{Number(order.discount_amount).toLocaleString("en-BD")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                <span>Total Amount:</span>
                <span className="text-primary text-base">
                  ৳{Number(order.total_amount || 0).toLocaleString("en-BD")}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>Payment Method:</span>
                </span>
                <span className="font-bold uppercase text-foreground">
                  {order.payment_info?.method || "COD"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  order.payment_info?.status === "paid"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {order.payment_info?.status || "Pending"}
                </span>
              </div>
            </div>

            {order.shipping_details && (
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      Recipient: {order.shipping_details.name} ({order.shipping_details.phone})
                    </span>
                    <p className="mt-0.5">{order.shipping_details.address}</p>
                    {order.shipping_details.city && <p>{order.shipping_details.city}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      <ReturnRequestModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        order={order}
        onSuccess={() => {
          setReturnRequested(true);
        }}
      />
    </div>
  );
}
