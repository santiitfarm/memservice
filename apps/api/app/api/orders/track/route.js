import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import { normalizeBDPhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function POST(request) {
  // 1. Rate-limit to 10 requests per minute per IP to prevent order harvesting
  const limited = await rateLimit(request, "orders-track", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  await connectMongo();

  try {
    const body = await request.json().catch(() => ({}));
    const { orderNumber, phone } = body;

    const trimmedOrderNum = typeof orderNumber === "string" ? orderNumber.trim() : "";
    const normalizedInputPhone = normalizeBDPhone(phone);

    // If either is missing or invalid format, return generic 404 immediately
    if (!trimmedOrderNum || !normalizedInputPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching order found for the provided order number and phone number.",
        },
        { status: 404 }
      );
    }

    // Lookup order by exact order_number (case-insensitive)
    const order = await Order.findOne({
      order_number: { $regex: new RegExp(`^${trimmedOrderNum.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    }).populate({
      path: "customer",
      model: CustomerProfile,
      select: "customer_name phone_number email",
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching order found for the provided order number and phone number.",
        },
        { status: 404 }
      );
    }

    // Verify phone matches either customer profile, shipping phone, or order contact
    const candidatePhones = [
      order.customer?.phone_number,
      order.phone_number,
      order.shipping_details?.phone,
      order.shipping_details?.phone_number,
    ]
      .filter(Boolean)
      .map((p) => normalizeBDPhone(p));

    const matchesPhone = candidatePhones.includes(normalizedInputPhone);

    if (!matchesPhone) {
      // Return generic 404 to avoid enumeration of order numbers
      return NextResponse.json(
        {
          success: false,
          message: "No matching order found for the provided order number and phone number.",
        },
        { status: 404 }
      );
    }

    // Build timeline
    const timeline = [];
    if (order.createdAt) {
      timeline.push({
        status: "order_placed",
        label: "Order Placed",
        timestamp: order.createdAt,
        description: "Your order has been placed and received by our team.",
      });
    }

    if (order.status === "processing" || ["shipped", "delivered"].includes(order.status)) {
      timeline.push({
        status: "processing",
        label: "Processing",
        timestamp: order.updatedAt || order.createdAt,
        description: "Your order is being packed and prepared for dispatch.",
      });
    }

    if (order.shipping_date || ["shipped", "delivered"].includes(order.status)) {
      timeline.push({
        status: "shipped",
        label: "Handed over to Courier",
        timestamp: order.shipping_date || order.updatedAt,
        description: order.shipment?.provider
          ? `Dispatched via ${order.shipment.provider.toUpperCase()}.`
          : "Dispatched for delivery.",
      });
    }

    if (order.status === "delivered" || order.delivery_date) {
      timeline.push({
        status: "delivered",
        label: "Delivered",
        timestamp: order.delivery_date || order.updatedAt,
        description: "Order successfully delivered.",
      });
    }

    if (order.status === "cancelled") {
      timeline.push({
        status: "cancelled",
        label: "Cancelled",
        timestamp: order.updatedAt,
        description: "This order has been cancelled.",
      });
    }

    if (["returned", "partially_returned"].includes(order.status)) {
      timeline.push({
        status: order.status,
        label: "Returned",
        timestamp: order.updatedAt,
        description: "This order has been returned.",
      });
    }

    // Sanitized items
    const items = (order.items || []).map((item) => ({
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      color: item.color || null,
      manufacturer: item.manufacturer || null,
    }));

    // Masked destination
    const destinationArea = [
      order.shipping_details?.area,
      order.shipping_details?.district,
      order.shipping_details?.zoneLabel,
    ]
      .filter(Boolean)
      .join(", ") || "Bangladesh";

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        status: order.status,
        deliveryStatus: order.shipment?.status || order.status,
        paymentStatus: order.payment_info?.status || "unpaid",
        paymentMethod: order.payment_info?.method || "cod",
        createdAt: order.createdAt,
        shippingDate: order.shipping_date || null,
        deliveryDate: order.delivery_date || null,
        destination: destinationArea,
        courier: {
          provider: order.shipment?.provider || null,
          consignmentId: order.shipment?.consignmentId || null,
          trackingCode: order.shipment?.trackingCode || order.tracking_number || null,
          trackingUrl: order.shipment?.trackingUrl || null,
        },
        items,
        totals: {
          subtotal: Number(order.total_amount) - (Number(order.shipping_details?.charge) || Number(order.shipping_details?.shipping_charge) || 0),
          deliveryCharge: Number(order.shipping_details?.charge) || Number(order.shipping_details?.shipping_charge) || 0,
          totalAmount: order.total_amount,
        },
        timeline,
      },
    });
  } catch (error) {
    console.error("POST /api/orders/track error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while tracking your order." },
      { status: 500 }
    );
  }
}
