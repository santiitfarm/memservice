import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import { getStaff, unauthorized } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required");
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") || "30d").toLowerCase();

  const now = new Date();
  let currentStart = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  if (range === "7d") {
    currentStart.setDate(now.getDate() - 7);
    prevStart.setDate(now.getDate() - 14);
    prevEnd.setDate(now.getDate() - 7);
  } else if (range === "90d") {
    currentStart.setDate(now.getDate() - 90);
    prevStart.setDate(now.getDate() - 180);
    prevEnd.setDate(now.getDate() - 90);
  } else if (range === "ytd") {
    currentStart = new Date(now.getFullYear(), 0, 1);
    const diffMs = now.getTime() - currentStart.getTime();
    prevEnd = new Date(currentStart.getTime());
    prevStart = new Date(currentStart.getTime() - diffMs);
  } else {
    // default 30d
    currentStart.setDate(now.getDate() - 30);
    prevStart.setDate(now.getDate() - 60);
    prevEnd.setDate(now.getDate() - 30);
  }

  try {
    // 1. Current period orders
    const currentOrders = await Order.find({
      createdAt: { $gte: currentStart, $lte: now },
    }).lean();

    // 2. Previous period orders for delta calculations
    const prevOrders = await Order.find({
      createdAt: { $gte: prevStart, $lt: prevEnd },
    }).lean();

    // Metrics computation
    const calcMetrics = (orders) => {
      const nonCancelled = orders.filter((o) => o.status !== "cancelled");
      const revenue = nonCancelled.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const totalCount = orders.length;
      const aov = totalCount > 0 ? Math.round(revenue / totalCount) : 0;
      const unitsSold = nonCancelled.reduce((sum, o) => {
        const itemQty = Array.isArray(o.items)
          ? o.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
          : 0;
        return sum + itemQty;
      }, 0);
      const uniqueCustomers = new Set(orders.map((o) => String(o.customer)).filter(Boolean)).size;

      return { revenue, totalCount, aov, unitsSold, uniqueCustomers };
    };

    const currentMetrics = calcMetrics(currentOrders);
    const prevMetrics = calcMetrics(prevOrders);

    const calcDelta = (curr, prev) => {
      if (prev <= 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const deltas = {
      revenue: calcDelta(currentMetrics.revenue, prevMetrics.revenue),
      orders: calcDelta(currentMetrics.totalCount, prevMetrics.totalCount),
      aov: calcDelta(currentMetrics.aov, prevMetrics.aov),
      unitsSold: calcDelta(currentMetrics.unitsSold, prevMetrics.unitsSold),
      customers: calcDelta(currentMetrics.uniqueCustomers, prevMetrics.uniqueCustomers),
    };

    // 3. Status breakdown
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    currentOrders.forEach((o) => {
      const st = (o.status || "pending").toLowerCase();
      if (statusCounts[st] !== undefined) {
        statusCounts[st] += 1;
      } else if (st === "partially_returned") {
        statusCounts.returned += 1;
      } else {
        statusCounts.pending += 1;
      }
    });

    // 4. Revenue Time Series for Chart
    // Create bucket for every single day in range
    const daysMap = new Map();
    const cursor = new Date(currentStart);
    cursor.setHours(0, 0, 0, 0);
    const endCursor = new Date(now);
    endCursor.setHours(23, 59, 59, 999);

    while (cursor <= endCursor) {
      const dateKey = cursor.toISOString().slice(0, 10);
      const label = cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      daysMap.set(dateKey, { date: dateKey, label, revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    currentOrders.forEach((o) => {
      if (!o.createdAt) return;
      const dKey = new Date(o.createdAt).toISOString().slice(0, 10);
      if (daysMap.has(dKey)) {
        const entry = daysMap.get(dKey);
        entry.orders += 1;
        if (o.status !== "cancelled") {
          entry.revenue += Number(o.total_amount) || 0;
        }
      }
    });

    const timeSeries = Array.from(daysMap.values());

    // 5. Top selling products
    const productSalesMap = new Map();
    currentOrders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        (o.items || []).forEach((item) => {
          const pId = String(item.id || item._id);
          if (!pId) return;
          if (!productSalesMap.has(pId)) {
            productSalesMap.set(pId, {
              id: pId,
              title: item.title,
              unitsSold: 0,
              revenue: 0,
            });
          }
          const rec = productSalesMap.get(pId);
          rec.unitsSold += Number(item.quantity) || 1;
          rec.revenue += Number(item.totalPrice) || Number(item.price) * (Number(item.quantity) || 1);
        });
      });

    const topProductList = Array.from(productSalesMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // 6. Low stock products
    const lowStockItems = await Product.find({
      status: "active",
      $or: [
        { $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } },
        { "variants.stock": { $lte: 5 } },
      ],
    })
      .select("name slug stock lowStockThreshold regular_price discount_price images")
      .sort({ stock: 1 })
      .limit(8)
      .lean();

    const lowStockTotal = await Product.countDocuments({
      status: "active",
      $or: [
        { $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] } },
        { "variants.stock": { $lte: 5 } },
      ],
    });

    // 7. Recent 10 orders
    const recentOrders = await Order.find()
      .populate({
        path: "customer",
        model: CustomerProfile,
        select: "customer_name phone_number email",
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      range,
      kpis: {
        revenue: currentMetrics.revenue,
        orders: currentMetrics.totalCount,
        aov: currentMetrics.aov,
        unitsSold: currentMetrics.unitsSold,
        customers: currentMetrics.uniqueCustomers,
        lowStockCount: lowStockTotal,
      },
      deltas,
      statusBreakdown: statusCounts,
      timeSeries,
      topProducts: topProductList,
      lowStockItems,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/analytics/summary error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
