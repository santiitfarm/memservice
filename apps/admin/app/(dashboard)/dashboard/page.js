"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useFetchAnalyticsSummaryQuery } from "@/store/slices/analyticsApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

const RANGES = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "ytd", label: "Year to Date" },
];

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#6366f1",
  delivered: "#10b981",
  cancelled: "#f43f5e",
  returned: "#a855f7",
};

export default function DashboardPage() {
  const [range, setRange] = useState("30d");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useFetchAnalyticsSummaryQuery(range);

  const kpis = data?.kpis || {
    revenue: 0,
    orders: 0,
    aov: 0,
    unitsSold: 0,
    customers: 0,
    lowStockCount: 0,
  };

  const deltas = data?.deltas || {
    revenue: 0,
    orders: 0,
    aov: 0,
    unitsSold: 0,
    customers: 0,
  };

  const statusData = [
    { name: "Pending", value: data?.statusBreakdown?.pending || 0, color: STATUS_COLORS.pending },
    { name: "Processing", value: data?.statusBreakdown?.processing || 0, color: STATUS_COLORS.processing },
    { name: "Shipped", value: data?.statusBreakdown?.shipped || 0, color: STATUS_COLORS.shipped },
    { name: "Delivered", value: data?.statusBreakdown?.delivered || 0, color: STATUS_COLORS.delivered },
    { name: "Cancelled", value: data?.statusBreakdown?.cancelled || 0, color: STATUS_COLORS.cancelled },
    { name: "Returned", value: data?.statusBreakdown?.returned || 0, color: STATUS_COLORS.returned },
  ].filter((item) => item.value > 0);

  const renderDelta = (val) => {
    const isPositive = val >= 0;
    return (
      <Badge
        variant={isPositive ? "success" : "destructive"}
        size="sm"
        className="gap-1 font-semibold"
      >
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? `+${val}%` : `${val}%`} vs previous period
      </Badge>
    );
  };

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
    <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Store Performance & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Live overview of sales, orders, fulfillment and inventory health
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-border p-1 bg-card shadow-sm">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  range === r.key
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

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
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Failed to load analytics: {error?.data?.message || error?.message || "Unknown error"}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                ৳{kpis.revenue.toLocaleString()}
              </div>
            )}
            <div className="mt-2">{isLoading ? <Skeleton className="h-4 w-28" /> : renderDelta(deltas.revenue)}</div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {kpis.orders.toLocaleString()}
              </div>
            )}
            <div className="mt-2">{isLoading ? <Skeleton className="h-4 w-28" /> : renderDelta(deltas.orders)}</div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {kpis.customers.toLocaleString()}
              </div>
            )}
            <div className="mt-2">{isLoading ? <Skeleton className="h-4 w-28" /> : renderDelta(deltas.customers)}</div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {kpis.lowStockCount} <span className="text-xs font-normal text-muted-foreground">SKUs</span>
              </div>
            )}
            <div className="mt-2">
              <Link href="/dashboard/inventory?filter=low" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1">
                View Low Inventory <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section: Revenue Area Chart & Order Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Time Series (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Timeline</CardTitle>
                <CardDescription>Daily revenue trends and sales volume</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Avg. Order Value</span>
                <p className="text-sm font-bold text-foreground">৳{kpis.aov.toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : !data?.timeSeries || data.timeSeries.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <EmptyState title="No Revenue Data" description="No sales recorded in the selected date range." />
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15a9e3" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#15a9e3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-lg text-xs space-y-1">
                              <p className="font-semibold text-foreground">{label}</p>
                              <p className="text-primary font-bold">
                                Revenue: ৳{payload[0].value.toLocaleString()}
                              </p>
                              <p className="text-muted-foreground">
                                Orders: {payload[0].payload.orders}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#15a9e3"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Donut Chart (1 col) */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Breakdown</CardTitle>
            <CardDescription>Current orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : statusData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <EmptyState title="No Orders" description="No orders found for this period." />
              </div>
            ) : (
              <div className="h-[280px] w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} orders`, name]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Status Pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {statusData.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.name}:</span>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Section: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders placed in store</CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
              <div className="p-8">
                <EmptyState title="No Orders" description="No orders have been placed yet." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground">
                      <th className="p-3 pl-6">Order #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 pl-6 font-mono text-xs font-bold text-foreground">
                          {order.order_number}
                        </td>
                        <td className="p-3 text-foreground font-medium">
                          {order.customer?.customer_name || "Guest Customer"}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          ৳{Number(order.total_amount).toLocaleString()}
                        </td>
                        <td className="p-3">{getOrderStatusBadge(order.status)}</td>
                        <td className="p-3 pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 w-8 p-0"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Low Stock Alert
                {kpis.lowStockCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {kpis.lowStockCount} items
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Items running dangerously low on stock</CardDescription>
            </div>
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="sm" className="gap-1">
                Manage Stock <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !data?.lowStockItems || data.lowStockItems.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Inventory Healthy"
                  description="All active products currently have sufficient stock levels."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground">
                      <th className="p-3 pl-6">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock Left</th>
                      <th className="p-3 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.lowStockItems.map((prod) => (
                      <tr key={prod._id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {prod.images?.[0] ? (
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-medium text-foreground line-clamp-1">
                              {prod.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          ৳{prod.discount_price > 0 ? prod.discount_price : prod.regular_price}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              prod.stock === 0
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {prod.stock === 0 ? "Out of stock" : `${prod.stock} units`}
                          </span>
                        </td>
                        <td className="p-3 pr-6 text-right">
                          <Link href={`/dashboard/inventory?product=${prod._id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                              Restock
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.order_number}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
              <div>
                <span className="text-xs text-muted-foreground">Customer</span>
                <p className="font-semibold text-foreground">
                  {selectedOrder.customer?.customer_name || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrder.customer?.phone_number || selectedOrder.phone_number}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="mt-1">{getOrderStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Payment</span>
                <p className="font-medium text-foreground capitalize">
                  {selectedOrder.payment_info?.method || "COD"} •{" "}
                  <span
                    className={
                      selectedOrder.payment_info?.status === "paid"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {selectedOrder.payment_info?.status || "unpaid"}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Total</span>
                <p className="text-base font-bold text-foreground">
                  ৳{Number(selectedOrder.total_amount).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-border/60 max-h-48 overflow-y-auto">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-muted-foreground">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">
                      ৳{Number(item.totalPrice || item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Link href={`/dashboard/orders/${selectedOrder._id}`}>
                <Button size="sm" className="gap-1.5">
                  Full Order Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
