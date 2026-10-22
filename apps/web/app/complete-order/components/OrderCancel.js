import { ShoppingBasket, PhoneCall, ClipboardList } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function OrderCancel({ order_no, phone = "+8801711655686" }) {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[75vh] bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-card border border-border shadow-lg rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-destructive">
              Order #{order_no} has been Cancelled
            </h1>
            <p className="mt-2 text-lg text-destructive/80 font-medium">Payment was not completed</p>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
              Please try again or contact our helpline for assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-xs sm:text-sm py-2.5 px-6 rounded-full hover:bg-primary/90 transition shadow-sm"
            >
              <ShoppingBasket className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-bold text-xs sm:text-sm py-2.5 px-6 rounded-full hover:bg-muted transition"
            >
              <ClipboardList className="w-4 h-4" />
              <span>View Order History</span>
            </Link>
          </div>

          <div className="text-center pt-2">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Need Help?
            </h3>
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
