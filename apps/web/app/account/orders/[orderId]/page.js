import OrderDetailClient from "./OrderDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Details - Mem Service",
  description: "View your order details, live shipment tracking, and invoice.",
};

export default async function OrderView({ params }) {
  const { orderId } = await params;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let order = null;
  try {
    const res = await fetch(`${apiUrl}/api/order/${orderId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      order = data?.order || null;
    }
  } catch (err) {
    console.error("Failed to fetch order:", err);
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Account</span>
          </Link>
        </div>

        <OrderDetailClient order={order} />
      </div>
    </div>
  );
}
