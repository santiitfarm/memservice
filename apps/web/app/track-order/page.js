import TrackOrderClient from "./TrackOrderClient";
import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Track Your Order - Mem Service",
  description: "Track your medicine and health product order in real-time with courier tracking integration.",
};

export default async function TrackOrderPage({ searchParams }) {
  const params = await searchParams;
  const initialOrderNumber = params?.orderNumber || params?.order || "";
  const initialPhone = params?.phone || "";

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Top Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Live Shipment & Order Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Enter your Order Number (e.g. <code>MS-241210-000001</code>) and the phone number used during checkout.
          </p>
        </div>

        {/* Track Order Client */}
        <TrackOrderClient
          initialOrderNumber={initialOrderNumber}
          initialPhone={initialPhone}
        />
      </div>
    </div>
  );
}
