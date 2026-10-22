"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, Clock, Check, AlertCircle, RefreshCw } from "lucide-react";
import { useVerifyPaymentMutation } from "@/store/slices/orderApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function PaymentVerificationPanel({ order, refetch }) {
  const [verifyPayment, { isLoading, error }] = useVerifyPaymentMutation();
  const paymentInfo = order.payment_info || {};
  const isPaid = paymentInfo.status === "paid";
  const isManualMfs =
    ["bkash", "nagad", "rocket", "upay"].includes((paymentInfo.method || "").toLowerCase()) ||
    !!paymentInfo.transaction_id ||
    !!paymentInfo.transaction_number;

  const handleMarkAsPaid = async () => {
    try {
      await verifyPayment({
        orderId: order._id,
        payment_info: {
          ...paymentInfo,
          status: "paid",
          verifiedAt: new Date(),
        },
      }).unwrap();
      if (refetch) refetch();
    } catch (err) {
      console.error("Failed to verify payment:", err);
    }
  };

  const handleMarkAsUnpaid = async () => {
    try {
      await verifyPayment({
        orderId: order._id,
        payment_info: {
          ...paymentInfo,
          status: "unpaid",
        },
      }).unwrap();
      if (refetch) refetch();
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Payment Verification</CardTitle>
              <CardDescription className="text-xs">
                Transaction audit and MFS payment verification
              </CardDescription>
            </div>
          </div>

          {isPaid ? (
            <Badge variant="success" size="sm" className="gap-1">
              <CheckCircle2 className="w-3 h-3" /> Paid
            </Badge>
          ) : (
            <Badge variant="warning" size="sm" className="gap-1">
              <Clock className="w-3 h-3" /> Unpaid
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error.data?.message || "Failed to update payment status"}</span>
          </div>
        )}

        <div className="p-3.5 bg-muted/30 rounded-lg border border-border/60 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px]">Method</span>
              <p className="font-bold text-foreground uppercase tracking-wide">
                {paymentInfo.method || "Cash on Delivery"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px]">Amount Payable</span>
              <p className="font-bold text-foreground text-sm">
                ৳{Number(paymentInfo.amount || order.total_amount).toLocaleString()}
              </p>
            </div>

            {/* TrxID if present */}
            {(paymentInfo.transaction_id || paymentInfo.transaction_number) && (
              <div className="col-span-2 pt-1 border-t border-border/40">
                <span className="text-muted-foreground text-[11px]">Submitted TrxID / Reference</span>
                <p className="font-mono font-bold text-primary text-sm">
                  {paymentInfo.transaction_id || paymentInfo.transaction_number}
                </p>
              </div>
            )}

            {paymentInfo.sender_phone && (
              <div className="col-span-2">
                <span className="text-muted-foreground text-[11px]">Sender Mobile Number</span>
                <p className="font-mono font-medium text-foreground">
                  {paymentInfo.sender_phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Action Buttons */}
        <div className="flex items-center gap-2">
          {!isPaid ? (
            <Button
              onClick={handleMarkAsPaid}
              disabled={isLoading}
              className="flex-1 gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Verify & Mark as Paid
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleMarkAsUnpaid}
              disabled={isLoading}
              className="flex-1 text-xs text-muted-foreground hover:text-destructive"
            >
              Revert to Unpaid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
