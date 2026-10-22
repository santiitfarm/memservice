"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { useBookCourierMutation } from "@/store/slices/orderApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const COURIERS = [
  { key: "steadfast", name: "Steadfast Courier", default: true },
  { key: "pathao", name: "Pathao Courier", default: false },
  { key: "redx", name: "RedX Delivery", default: false },
];

export default function CourierBookingPanel({ order, refetch }) {
  const [selectedCourier, setSelectedCourier] = useState(
    order.shipment?.provider || order.shipping_details?.courier || "steadfast"
  );
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [copied, setCopied] = useState(false);

  const [bookCourier, { isLoading, error, isSuccess }] = useBookCourierMutation();

  const shipment = order.shipment;
  const isBooked = !!(shipment?.trackingCode || shipment?.consignmentId);

  const handleBook = async () => {
    try {
      await bookCourier({
        orderId: order._id,
        provider: selectedCourier,
        instruction: specialInstruction,
      }).unwrap();
      if (refetch) refetch();
    } catch (err) {
      console.error("Failed to book courier:", err);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Courier Fulfillment</CardTitle>
              <CardDescription className="text-xs">
                Book shipment with Bangladesh courier partners
              </CardDescription>
            </div>
          </div>

          {isBooked ? (
            <Badge variant="success" size="sm" className="gap-1">
              <CheckCircle2 className="w-3 h-3" /> Booked
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              Not Booked
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error.data?.error || error.data?.message || "Failed to book courier"}</span>
          </div>
        )}

        {isBooked ? (
          /* Booked Details */
          <div className="space-y-3 p-3.5 bg-muted/30 rounded-lg border border-border/60">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px]">Provider</span>
                <p className="font-bold text-foreground uppercase tracking-wide">
                  {shipment.provider}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground text-[11px]">Consignment ID</span>
                <p className="font-mono font-medium text-foreground">
                  {shipment.consignmentId || "—"}
                </p>
              </div>

              <div className="col-span-2">
                <span className="text-muted-foreground text-[11px]">Tracking Code</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="font-mono font-bold text-primary text-sm">
                    {shipment.trackingCode}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(shipment.trackingCode)}
                    className="h-7 text-[11px] gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy Code"}
                  </Button>
                </div>
              </div>
            </div>

            {shipment.trackingUrl && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-xs"
                >
                  Open Live Tracking Link <ExternalLink className="w-3 h-3" />
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch && refetch()}
                  className="h-7 text-xs gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Booking Form */
          <div className="space-y-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1.5">
                Select Courier Partner
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COURIERS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedCourier(c.key)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      selectedCourier === c.key
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{c.name}</p>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {c.key === "steadfast" ? "API V1" : "Webhook"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">
                Special Delivery Instruction (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call before delivery, fragile medicine"
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              onClick={handleBook}
              disabled={isLoading || order.status === "cancelled"}
              className="w-full gap-2 text-xs font-semibold"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Consignment...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Book with {COURIERS.find((c) => c.key === selectedCourier)?.name || selectedCourier}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
