import { ShoppingBag, Package, ExternalLink, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";

export default function OrderHistory({ user }) {
  const rawOrders = user?.orders || [];
  // Ensure we only map valid populated order objects
  const orders = Array.isArray(rawOrders)
    ? rawOrders.filter((o) => o && typeof o === "object" && (o._id || o.order_number))
    : [];

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            No Orders Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven&#39;t placed any medicine orders yet. Explore our pharmacy collection to get started.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse All Medicines</span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "completed") {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
    if (s === "cancelled" || s === "failed") {
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    }
    if (s === "shipped" || s === "out-for-delivery") {
      return "bg-sky-500/10 text-sky-600 border-sky-500/20";
    }
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Order History ({orders.length})
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          View details and tracking
        </span>
      </div>

      <div className="divide-y divide-border">
        {orders.map((order) => {
          const dateStr = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—";

          const paymentStatus = order.payment_info?.status || "unpaid";
          const totalAmount = order.total_amount || 0;

          return (
            <div
              key={order._id || order.order_number}
              className="p-4 sm:p-5 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <span>Order #{order.order_number || String(order._id).slice(-8)}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </Link>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status || "processing"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="capitalize">{paymentStatus}</span>
                  </span>
                  <span>
                    Items: {Array.isArray(order.items) ? order.items.length : 1}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <span className="text-sm font-extrabold text-foreground">
                  ৳{totalAmount}
                </span>

                <Link
                  href={`/account/orders/${order._id}`}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
