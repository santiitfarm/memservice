import { NextResponse } from "next/server";

const STATUS_MAP = {
  pending: {
    label: "Pending Confirmation",
    labelBn: "অপেক্ষমান",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    color: "#f59e0b",
    description: "Your order has been submitted and is awaiting confirmation by our team.",
  },
  processing: {
    label: "Processing",
    labelBn: "প্রক্রিয়াধীন",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    color: "#3b82f6",
    description: "Your order is being reviewed, verified, and packaged for dispatch.",
  },
  shipped: {
    label: "Shipped",
    labelBn: "ডেলিভারির পথে",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    color: "#6366f1",
    description: "Your package has been dispatched and handed over to our courier partner.",
  },
  delivered: {
    label: "Delivered",
    labelBn: "ডেলিভার্ড",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    color: "#10b981",
    description: "Your order has been successfully delivered to your shipping address.",
  },
  cancelled: {
    label: "Cancelled",
    labelBn: "বাতিল",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    color: "#f43f5e",
    description: "This order has been cancelled.",
  },
  returned: {
    label: "Returned",
    labelBn: "ফেরত",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    color: "#a855f7",
    description: "This order has been returned.",
  },
  partially_returned: {
    label: "Partially Returned",
    labelBn: "আংশিক ফেরত",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    color: "#a855f7",
    description: "One or more items from this order have been returned.",
  },
};

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      statuses: STATUS_MAP,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
