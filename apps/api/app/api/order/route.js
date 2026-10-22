import { Counter, getNextOrderNumber } from "@/app/models/Counter";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import Coupon from "@/app/models/Coupon";
import CouponRedemption from "@/app/models/CouponRedemption";
import IdempotencyKey from "@/app/models/IdempotencyKey";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import StockMovement from "@/app/models/StockMovement";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { getIntegration } from "@/lib/integrations/resolver";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { priceOrder } from "@/lib/pricing";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongo();

  try {
    const orders = await Order.find()
      .populate({
        path: "customer",
        model: CustomerProfile,
        select: SAFE_CUSTOMER_FIELDS,
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectMongo();

  // 1. Checkout Idempotency Header Check
  const idempotencyHeader =
    request.headers.get("idempotency-key") ||
    request.headers.get("x-idempotency-key");
  const idempotencyKey = idempotencyHeader ? idempotencyHeader.trim() : null;

  if (idempotencyKey) {
    try {
      const existingKey = await IdempotencyKey.findOne({
        key: idempotencyKey,
      }).lean();
      if (existingKey && existingKey.responseBody) {
        return NextResponse.json(existingKey.responseBody, {
          status: 200,
          headers: { "X-Idempotent-Replay": "true" },
        });
      }
    } catch (idempCheckErr) {
      console.warn("Idempotency lookup warning:", idempCheckErr.message);
    }
  }

  const body = await request.json().catch(() => ({}));

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { success: false, message: "Order must contain at least one item" },
      { status: 400 }
    );
  }

  // 2. Authoritative Server Pricing Engine
  const zoneKey = body.shipping_details?.zoneKey;
  const district = body.shipping_details?.district;
  const area = body.shipping_details?.area;
  const paymentMethod = (body.payment_info?.method || "cod").toLowerCase();
  const couponCode = body.couponCode || "";

  let priced = null;
  try {
    priced = await priceOrder({
      items: body.items,
      zoneKey,
      district,
      area,
      paymentMethod,
      couponCode,
      customer: body.customer || { phone_number: body.phone_number },
      allowOutOfStock: false,
    });
  } catch (priceErr) {
    console.warn("Order pricing validation failed:", priceErr.message);
    if (priceErr.code === "OUT_OF_STOCK") {
      return NextResponse.json(
        {
          success: false,
          code: "OUT_OF_STOCK",
          message: priceErr.message,
          productId: priceErr.productId,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        code: priceErr.code || "INVALID_ORDER",
        message: priceErr.message,
      },
      { status: 400 }
    );
  }

  // Delivery zone checks
  if (priced.deliveryQuote?.reasons?.some((r) => r.includes("Minimum order value"))) {
    return NextResponse.json(
      { success: false, message: priced.deliveryQuote.reasons.join(", ") },
      { status: 400 }
    );
  }

  if (paymentMethod === "cod" && !priced.deliveryQuote?.codAvailable) {
    return NextResponse.json(
      {
        success: false,
        message: `Cash on Delivery is unavailable for ${priced.deliveryQuote?.zoneLabel || "this area"}. Please select an online payment method.`,
      },
      { status: 400 }
    );
  }

  // 3. Payment Gateway Enforcement
  const adapter = getPaymentAdapter(paymentMethod);
  if (!adapter) {
    return NextResponse.json(
      { success: false, message: `Unsupported payment method: ${paymentMethod}` },
      { status: 400 }
    );
  }

  const integration = await getIntegration(paymentMethod);
  if (!integration || !integration.enabled) {
    return NextResponse.json(
      {
        success: false,
        message: `Payment method "${paymentMethod}" is currently unavailable. Please choose another option.`,
      },
      { status: 400 }
    );
  }

  // 4. Anti-Tampering Check: Compare Client-Sent Total with Authoritative Server Total
  const clientSentTotal =
    body.total_amount !== undefined && body.total_amount !== null
      ? Number(body.total_amount)
      : null;

  if (clientSentTotal !== null && !isNaN(clientSentTotal)) {
    const diff = Math.abs(clientSentTotal - priced.totalAmount);
    if (diff > 1.0) {
      return NextResponse.json(
        {
          success: false,
          code: "PRICE_CHANGED",
          message: "Product prices or delivery charges have changed. Please review your cart.",
          cart: priced.items,
          total: priced.totalAmount,
        },
        { status: 409 }
      );
    }
  }

  // 5. Transactional Order Creation and Atomic Stock Decrement
  const session = await mongoose.startSession();
  let createdOrder = null;

  try {
    await session.withTransaction(async () => {
      // 5.2 Server-side atomic order number generation
      const serverOrderNumber = await getNextOrderNumber(session);

      // 5.1 Atomic inventory decrement with stock condition check & StockMovement log
      for (const item of priced.items) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.id,
            stock: { $gte: item.quantity },
            status: "active",
          },
          {
            $inc: {
              stock: -item.quantity,
              sold_out: item.quantity,
            },
          },
          { session, new: true }
        );

        if (!updated) {
          const currentProd = await Product.findById(item.id).session(session);
          const name = currentProd ? currentProd.name : item.title || item.id;
          const err = new Error(`Insufficient stock for product: ${name}`);
          err.code = "OUT_OF_STOCK";
          throw err;
        }

        await StockMovement.create(
          [
            {
              product: updated._id,
              variantSku: item.variantSku || null,
              delta: -item.quantity,
              reason: "order",
              reference: `Order #${serverOrderNumber}`,
              balanceAfter: updated.stock,
              by: null,
              at: new Date(),
            },
          ],
          { session }
        );
      }

      // 5.3 Customer profile lookup or auto-creation
      let customerId = body.customer;
      const customerInput =
        typeof body.customer === "object" &&
        body.customer !== null &&
        !mongoose.Types.ObjectId.isValid(body.customer)
          ? body.customer
          : {
              customer_name: body.customer_name || "Customer",
              phone_number: body.phone_number || "01700000000",
              email: body.email,
              address: body.shipping_details?.address || "",
            };

      if (customerInput.phone_number) {
        body.email = customerInput.email || body.email;
        body.customer_name = customerInput.customer_name || body.customer_name;
        body.phone_number = customerInput.phone_number || body.phone_number;
        customerId = await createOrUpdateCustomer(customerInput, session);
      }

      // 5.4 Build authoritative order document
      const orderDoc = {
        ...body,
        order_number: serverOrderNumber,
        customer: customerId,
        items: priced.items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
          color: i.color,
          manufacturer: i.manufacturer,
        })),
        total_amount: priced.totalAmount,
        discount: priced.discount || 0,
        coupon: priced.coupon
          ? {
              code: priced.coupon.code,
              type: priced.coupon.type,
              value: priced.coupon.value,
              discountAmount: priced.discount,
            }
          : null,
        shipping_details: {
          ...(body.shipping_details || {}),
          zoneKey: priced.deliveryQuote.zoneKey,
          zoneLabel: priced.deliveryQuote.zoneLabel,
          charge: priced.deliveryCharge,
          shipping_charge: priced.deliveryCharge,
          eta: priced.deliveryQuote.eta,
        },
        payment_info: {
          ...(body.payment_info || {}),
          method: paymentMethod,
          provider: paymentMethod,
          amount: priced.totalAmount,
          status: paymentMethod === "cod" ? "unpaid" : "pending",
        },
      };

      const [newOrder] = await Order.create([orderDoc], { session });
      createdOrder = newOrder;

      // 5.5 Atomic coupon redemption recording
      if (priced.coupon?.couponId && priced.discount > 0) {
        await Coupon.findByIdAndUpdate(
          priced.coupon.couponId,
          { $inc: { usedCount: 1 } },
          { session }
        );

        await CouponRedemption.create(
          [
            {
              coupon: priced.coupon.couponId,
              code: priced.coupon.code,
              order: newOrder._id,
              customer: customerId || null,
              phone: customerInput.phone_number || body.phone_number || null,
              discountAmount: priced.discount,
              redeemedAt: new Date(),
            },
          ],
          { session }
        );
      }

      if (customerId) {
        await CustomerProfile.findByIdAndUpdate(
          customerId,
          { $push: { orders: newOrder._id } },
          { session }
        );
      }
    });
  } catch (txError) {
    console.error("Order transaction aborted:", txError.message);
    if (txError.code === "OUT_OF_STOCK") {
      return NextResponse.json(
        {
          success: false,
          code: "OUT_OF_STOCK",
          message: txError.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: txError.message || "Failed to create order",
      },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }

  // 6. Payment Gateway Initiation
  let paymentResult = null;
  try {
    paymentResult = await adapter.createPayment(createdOrder);
  } catch (paymentErr) {
    console.error(
      `Failed to initiate ${paymentMethod} payment session:`,
      paymentErr.message
    );
    if (paymentMethod !== "cod") {
      await cancelAndRestockOrder(createdOrder);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to connect with ${paymentMethod.toUpperCase()} gateway: ${paymentErr.message}`,
        },
        { status: 502 }
      );
    }
  }

  if (paymentResult) {
    createdOrder.paymentID = paymentResult.paymentID || createdOrder.paymentID;
    if (paymentResult.redirectUrl) {
      createdOrder.bkashURL = paymentResult.redirectUrl;
      createdOrder.payment_url = paymentResult.redirectUrl;
    }
    await createdOrder.save();
  }

  // 7. Transactional Email Notification
  if (paymentMethod === "cod" || paymentResult?.isImmediate) {
    if (createdOrder.email || body.email) {
      sendOrderConfirmationEmail(createdOrder).catch((err) =>
        console.error("sendOrderConfirmationEmail error:", err.message)
      );
    }
  }

  // 8. Prepare Response & Save Idempotency Record
  const responsePayload = {
    message: "Order created successfully",
    success: true,
    payment_url: paymentResult?.redirectUrl || null,
    order: createdOrder,
  };

  if (idempotencyKey) {
    try {
      await IdempotencyKey.create({
        key: idempotencyKey,
        orderId: createdOrder._id,
        responseBody: responsePayload,
      });
    } catch (saveIdempErr) {
      console.warn("Could not save idempotency record:", saveIdempErr.message);
    }
  }

  return NextResponse.json(responsePayload, { status: 200 });
}

async function createOrUpdateCustomer(customerData, session) {
  let customer = await CustomerProfile.findOne({
    phone_number: customerData.phone_number,
  }).session(session);

  if (!customer) {
    const [newCustomer] = await CustomerProfile.create([customerData], {
      session,
    });
    return newCustomer._id;
  }

  return customer._id;
}

async function cancelAndRestockOrder(order) {
  if (!order) return;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Order.findByIdAndUpdate(
        order._id,
        { status: "cancelled" },
        { session }
      );
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const updated = await Product.findByIdAndUpdate(
            item.id,
            {
              $inc: {
                stock: item.quantity,
                sold_out: -item.quantity,
              },
            },
            { session, new: true }
          );

          if (updated) {
            await StockMovement.create(
              [
                {
                  product: updated._id,
                  variantSku: item.variantSku || null,
                  delta: item.quantity,
                  reason: "cancel",
                  reference: `Order #${order.order_number} cancelled`,
                  balanceAfter: updated.stock,
                  by: null,
                  at: new Date(),
                },
              ],
              { session }
            );
          }
        }
      }

      // Revert coupon redemption if exists
      const redemption = await CouponRedemption.findOne({ order: order._id }).session(session);
      if (redemption) {
        await Coupon.findByIdAndUpdate(
          redemption.coupon,
          { $inc: { usedCount: -1 } },
          { session }
        );
        await CouponRedemption.deleteOne({ _id: redemption._id }).session(session);
      }
    });
  } catch (err) {
    console.error("Failed to cancel and restock order:", err.message);
  } finally {
    await session.endSession();
  }
}
