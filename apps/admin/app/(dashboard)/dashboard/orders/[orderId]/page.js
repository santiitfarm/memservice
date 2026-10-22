"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Printer,
  ChevronLeft,
  User,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  RefreshCw,
  Package,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import {
  useFetchSingleOrdersQuery,
  useUpdateOrderMutation,
} from "@/store/slices/orderApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import CourierBookingPanel from "../_components/CourierBookingPanel";
import PaymentVerificationPanel from "../_components/PaymentVerificationPanel";
import { VoucherTemplateOrder } from "../_components/VoucherTemplate";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default function OrderDetailsPage({ params }) {
  const orderId = params.orderId;
  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchSingleOrdersQuery(orderId);

  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [statusNote, setStatusNote] = useState("");

  const order = data?.order;

  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(VoucherTemplateOrder(order));
      printWindow.document.close();
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "cancelled") {
      setShowCancelModal(true);
      return;
    }

    try {
      await updateOrder({
        _id: order._id,
        status: newStatus,
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await updateOrder({
        _id: order._id,
        status: "cancelled",
        note: statusNote || "Cancelled by admin from dashboard",
      }).unwrap();
      setShowCancelModal(false);
      refetch();
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center">
        <EmptyState
          title="Order Not Found"
          description={error?.data?.message || "Could not retrieve the specified order."}
        />
        <div className="mt-6">
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getOrderStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "shipped":
        return <Badge variant="info">Shipped</Badge>;
      case "processing":
        return <Badge variant="default">Processing</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "returned":
      case "partially_returned":
        return <Badge variant="secondary">Returned</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/orders"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Orders
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-mono font-bold text-foreground">
              {order.order_number}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order {order.order_number}
            </h1>
            {getOrderStatusBadge(order.status)}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Changer Select */}
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating || order.status === "cancelled"}
            className="px-3 py-2 text-xs font-semibold bg-card border border-border rounded-lg text-foreground capitalize focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st} className="capitalize">
                Status: {st}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </Button>

          {order.status !== "cancelled" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Grid: 3 summary cards (Customer, Delivery, Payment) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px]">Full Name</span>
              <p className="font-semibold text-foreground text-sm">
                {order.customer?.customer_name || "Guest Customer"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <a
                href={`tel:${order.customer?.phone_number || order.phone_number}`}
                className="hover:underline font-mono text-foreground"
              >
                {order.customer?.phone_number || order.phone_number || "—"}
              </a>
            </div>
            {order.customer?.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-foreground">{order.customer.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping & Delivery Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground text-[11px]">Destination Area</span>
              <p className="font-semibold text-foreground">
                {[
                  order.shipping_details?.area,
                  order.shipping_details?.district,
                  order.shipping_details?.zoneLabel,
                ]
                  .filter(Boolean)
                  .join(", ") || "Dhaka / Bangladesh"}
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {order.shipping_details?.address || "No detailed address provided."}
            </p>
            {order.shipping_details?.eta && (
              <p className="text-[11px] text-primary font-medium">
                ETA: {order.shipping_details.eta}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Order Totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-medium text-foreground">
                ৳{(
                  Number(order.total_amount) -
                  (Number(order.shipping_details?.charge) ||
                    Number(order.shipping_details?.shipping_charge) ||
                    0) +
                  (Number(order.discount) || 0)
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charge:</span>
              <span className="font-medium text-foreground">
                ৳{(
                  Number(order.shipping_details?.charge) ||
                  Number(order.shipping_details?.shipping_charge) ||
                  0
                ).toLocaleString()}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Coupon Discount ({order.coupon?.code || "PROMO"}):</span>
                <span>-৳{Number(order.discount).toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
              <span>Grand Total:</span>
              <span>৳{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courier & Payment Action Panels (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CourierBookingPanel order={order} refetch={refetch} />
        <PaymentVerificationPanel order={order} refetch={refetch} />
      </div>

      {/* Itemized Order Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ordered Products ({order.items?.length || 0})</CardTitle>
          <CardDescription className="text-xs">
            Itemized breakdown of purchased items and quantities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-6">Product</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5 pr-6 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {(order.items || []).map((item, index) => {
                  const lineTotal =
                    Number(item.totalPrice) ||
                    Number(item.price) * (Number(item.quantity) || 1);

                  return (
                    <tr key={index} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-6">
                        <div className="font-medium text-foreground">{item.title}</div>
                        {item.color && (
                          <span className="text-[11px] text-muted-foreground">
                            Color/Variant: {item.color}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono">
                        ৳{Number(item.price).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold">{item.quantity}</td>
                      <td className="p-3.5 pr-6 text-right font-bold text-foreground">
                        ৳{lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Cancellation Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Order & Restock Inventory"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-600 dark:text-rose-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Are you sure you want to cancel this order?</p>
                <p className="mt-1">
                  Cancelling will automatically restock all {order.items?.length || 0} items
                  back into product inventory and generate corresponding StockMovement audit logs.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground font-medium mb-1">
                Cancellation Reason / Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Customer requested cancellation, out of stock"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={isUpdating}
                className="gap-1.5"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Confirm Cancellation & Restock
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
