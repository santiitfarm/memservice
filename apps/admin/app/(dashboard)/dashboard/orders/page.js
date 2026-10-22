"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  AlertCircle,
  Truck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useFetchOrdersQuery } from "@/store/slices/orderApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "returned", label: "Returned" },
];

export default function OrderDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFetchOrdersQuery();
  const rawOrders = data?.orders || [];

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

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

  const getPaymentStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return <Badge variant="success" size="sm">Paid</Badge>;
      case "refunded":
        return <Badge variant="secondary" size="sm">Refunded</Badge>;
      case "partially-paid":
        return <Badge variant="info" size="sm">Partially Paid</Badge>;
      default:
        return <Badge variant="warning" size="sm">Unpaid</Badge>;
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      // Tab filter
      if (activeTab !== "all") {
        if (activeTab === "returned") {
          if (!["returned", "partially_returned"].includes(order.status)) return false;
        } else if (order.status !== activeTab) {
          return false;
        }
      }

      // Payment filter
      if (paymentFilter !== "all") {
        if (order.payment_info?.status !== paymentFilter) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const num = (order.order_number || "").toLowerCase();
        const name = (order.customer?.customer_name || "").toLowerCase();
        const phone = (
          order.customer?.phone_number ||
          order.phone_number ||
          order.shipping_details?.phone ||
          ""
        ).toLowerCase();
        return num.includes(query) || name.includes(query) || phone.includes(query);
      }

      return true;
    });
  }, [rawOrders, activeTab, paymentFilter, searchTerm]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  // CSV export handler
  const handleExportCsv = () => {
    if (!filteredOrders.length) return;
    const headers = [
      "Order Number",
      "Created At",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Delivery Address",
      "Total Amount (BDT)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Courier",
      "Tracking Code",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_number || ""}"`,
      `"${o.createdAt ? new Date(o.createdAt).toISOString() : ""}"`,
      `"${(o.customer?.customer_name || "").replace(/"/g, '""')}"`,
      `"${o.customer?.phone_number || o.phone_number || ""}"`,
      `"${o.customer?.email || o.email || ""}"`,
      `"${(o.shipping_details?.address || "").replace(/"/g, '""')}"`,
      Number(o.total_amount) || 0,
      `"${o.payment_info?.method || "cod"}"`,
      `"${o.payment_info?.status || "unpaid"}"`,
      `"${o.status || "pending"}"`,
      `"${o.shipment?.provider || ""}"`,
      `"${o.shipment?.trackingCode || o.tracking_number || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track, filter, book couriers, and manage customer orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredOrders.length === 0}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV ({filteredOrders.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Failed to load orders: {error?.data?.message || error?.message || "Unknown error"}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card>
        {/* Filter Controls Header */}
        <CardHeader className="p-4 space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/40">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? rawOrders.length
                  : tab.key === "returned"
                  ? rawOrders.filter((o) => ["returned", "partially_returned"].includes(o.status)).length
                  : rawOrders.filter((o) => o.status === tab.key).length;

              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Secondary Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order #, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-muted/20 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partially-paid">Partially Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Orders Table */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Orders Found"
                description={
                  searchTerm || activeTab !== "all" || paymentFilter !== "all"
                    ? "Try adjusting your filters or search query."
                    : "Orders will appear here once customers complete checkout."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-6">Order ID</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Shipping Details</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Order Status</th>
                    <th className="p-3.5">Courier</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground">
                  {paginatedOrders.map((order) => {
                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 pl-6 font-mono font-bold text-primary">
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            {order.order_number}
                          </Link>
                        </td>

                        <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-foreground">
                            {order.customer?.customer_name || "Guest Customer"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {order.customer?.phone_number || order.phone_number || "—"}
                          </div>
                        </td>

                        <td className="p-3.5 max-w-xs truncate text-muted-foreground">
                          {order.shipping_details?.address || "—"}
                        </td>

                        <td className="p-3.5 font-bold text-foreground">
                          ৳{Number(order.total_amount).toLocaleString()}
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            {getPaymentStatusBadge(order.payment_info?.status)}
                            <span className="text-[10px] text-muted-foreground uppercase">
                              {order.payment_info?.method || "cod"}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">{getOrderStatusBadge(order.status)}</td>

                        <td className="p-3.5">
                          {order.shipment?.provider ? (
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="font-semibold uppercase text-primary">
                                {order.shipment.provider}
                              </span>
                              {order.shipment.trackingCode && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {order.shipment.trackingCode}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">Unbooked</span>
                          )}
                        </td>

                        <td className="p-3.5 pr-6 text-right">
                          <Link href={`/dashboard/orders/${order._id}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                              Manage <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalItems)} of {totalItems} orders
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="px-2 font-medium text-foreground">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
