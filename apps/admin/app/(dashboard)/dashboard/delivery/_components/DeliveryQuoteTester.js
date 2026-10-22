"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { useCalculateQuoteMutation } from "@/store/slices/deliveryApi";
import { Calculator, CheckCircle2, AlertTriangle, ArrowRight, Truck } from "lucide-react";

export default function DeliveryQuoteTester({ zones = [] }) {
  const [selectedZone, setSelectedZone] = useState(zones[0]?.key || "inside_dhaka");
  const [subtotal, setSubtotal] = useState("1200");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [district, setDistrict] = useState("Dhaka");
  const [resultQuote, setResultQuote] = useState(null);

  const [calculateQuote, { isLoading }] = useCalculateQuoteMutation();

  const handleTestQuote = async (e) => {
    e.preventDefault();
    try {
      const res = await calculateQuote({
        zoneKey: selectedZone,
        subtotal: Number(subtotal) || 0,
        paymentMethod,
        district,
      }).unwrap();

      if (res?.success) {
        setResultQuote(res.quote);
      }
    } catch (err) {
      console.error("Quote test error:", err);
    }
  };

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Delivery Quote Tester
            </CardTitle>
            <CardDescription className="text-xs">
              Simulate live checkout shipping calculations and verify free delivery rules.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTestQuote} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <Select
            label="Target Delivery Zone"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z._id} value={z.key}>
                {z.label} (Base ৳{z.charge})
              </option>
            ))}
          </Select>

          <Input
            label="Cart Subtotal (৳ BDT)"
            type="number"
            min="0"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            placeholder="1200"
            required
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="sslcommerz">Card / SSLCommerz</option>
            <option value="manual_mfs">Manual MFS</option>
          </Select>

          <Button type="submit" isLoading={isLoading} className="gap-2 w-full">
            <Truck className="w-4 h-4" /> Calculate Quote
          </Button>
        </form>

        {resultQuote && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">
                    {resultQuote.zoneName || resultQuote.zoneLabel || selectedZone}
                  </span>
                  {(resultQuote.free || resultQuote.isFree || resultQuote.charge === 0) ? (
                    <Badge variant="success">Free Shipping Applied</Badge>
                  ) : (
                    <Badge variant="secondary">Standard Rate</Badge>
                  )}
                  {(resultQuote.codAvailable || resultQuote.codAllowed) ? (
                    <Badge variant="info">COD Allowed</Badge>
                  ) : (
                    <Badge variant="destructive">COD Disabled</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Estimated Delivery: <span className="font-semibold text-foreground">{resultQuote.eta || "N/A"}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">Effective Charge</div>
                <div className="text-xl font-bold text-primary">
                  {resultQuote.charge === 0 ? "FREE (৳0)" : `৳${resultQuote.charge}`}
                </div>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-muted-foreground block text-[11px]">Cart Subtotal</span>
                <span className="font-semibold text-foreground">৳{resultQuote.subtotal || subtotal}</span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-muted-foreground block text-[11px]">Free Threshold</span>
                <span className="font-semibold text-foreground">
                  {resultQuote.freeAbove ? `৳${resultQuote.freeAbove}` : "None"}
                </span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="text-muted-foreground block text-[11px]">Threshold Gap</span>
                <span className="font-semibold text-foreground">
                  {resultQuote.amountForFreeShipping > 0
                    ? `Need ৳${resultQuote.amountForFreeShipping} more`
                    : "Reached Free Tier"}
                </span>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                <span className="text-primary block text-[11px] font-semibold">Total with Shipping</span>
                <span className="font-bold text-primary">
                  ৳{(Number(subtotal) || 0) + Number(resultQuote.charge || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
