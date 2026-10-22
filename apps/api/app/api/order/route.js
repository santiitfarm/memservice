import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { calculateDeliveryQuote } from "@/lib/delivery";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { getIntegration } from "@/lib/integrations/resolver";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
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
    console.log(error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function POST(request) {
  await connectMongo();

  const body = await request.json();

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { success: false, message: "Order must contain at least one item" },
      { status: 400 }
    );
  }

  // 1. Calculate items subtotal server-side & normalize fields
  let subtotal = 0;
  for (const item of body.items) {
    if (!item.title && item.name) {
      item.title = item.name;
    }
    const price = Number(item.price) || 0;
    const qty = Math.max(1, Number(item.quantity) || 1);
    subtotal += price * qty;
  }

  // 2. Server-Side Delivery Quote Enforcement (SINGLE source of truth)
  const zoneKey = body.shipping_details?.zoneKey;
  const district = body.shipping_details?.district;
  const area = body.shipping_details?.area;
  const paymentMethod = (body.payment_info?.method || "cod").toLowerCase();

  const deliveryQuote = await calculateDeliveryQuote({
    zoneKey,
    subtotal,
    paymentMethod,
    district,
    area,
  });

  // Check if minimum order value was violated
  if (deliveryQuote.reasons?.some((r) => r.includes("Minimum order value"))) {
    return NextResponse.json(
      { success: false, message: deliveryQuote.reasons.join(", ") },
      { status: 400 }
    );
  }

  // If COD chosen, verify COD availability for the delivery zone
  if (paymentMethod === "cod" && !deliveryQuote.codAvailable) {
    return NextResponse.json(
      {
        success: false,
        message: `Cash on Delivery is unavailable for ${deliveryQuote.zoneLabel}. Please select online payment.`,
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

  // Recompute total amount strictly using server calculated quote (override client-sent charges)
  const serverCharge = Number(deliveryQuote.charge);
  const totalAmount = subtotal + serverCharge;

  body.total_amount = totalAmount;
  body.payment_info = {
    ...(body.payment_info || {}),
    method: paymentMethod,
    provider: paymentMethod,
    amount: totalAmount,
    status: paymentMethod === "cod" ? "unpaid" : "pending",
  };

  body.shipping_details = {
    ...(body.shipping_details || {}),
    zoneKey: deliveryQuote.zoneKey,
    zoneLabel: deliveryQuote.zoneLabel,
    charge: serverCharge,
    shipping_charge: serverCharge,
    eta: deliveryQuote.eta,
  };

  if (!body.order_number) {
    body.order_number = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check and reserve product stock transactionally
    await updateProductStock(body.items, session);

    // Create or update customer profile
    const customerInput =
      typeof body.customer === "object" && body.customer !== null && !mongoose.Types.ObjectId.isValid(body.customer)
        ? body.customer
        : {
            customer_name: body.customer_name || "Customer",
            phone_number: body.phone_number || "01700000000",
            email: body.email,
          };

    if (customerInput.phone_number) {
      body.email = customerInput.email || body.email;
      body.customer_name = customerInput.customer_name || body.customer_name;
      body.phone_number = customerInput.phone_number || body.phone_number;
      body.customer = await createOrUpdateCustomer(customerInput, session);
    } else if (body.customer && mongoose.Types.ObjectId.isValid(body.customer)) {
      // Already an ObjectId reference
    }

    // Create order document
    const [order] = await Order.create([body], { session });

    // Update customer orders array
    if (body.customer) {
      await CustomerProfile.findByIdAndUpdate(
        body.customer,
        { $push: { orders: order._id } },
        { session }
      );
    }

    await session.commitTransaction();

    // 4. Initialize Payment with Provider Adapter
    let paymentResult = null;
    try {
      paymentResult = await adapter.createPayment(order);
    } catch (paymentErr) {
      console.error(`Failed to initiate ${paymentMethod} payment session:`, paymentErr.message);
      // For online gateways, if initialization fails, mark order cancelled and restock
      if (paymentMethod !== "cod") {
        await cancelOrder(order);
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
      order.paymentID = paymentResult.paymentID || order.paymentID;
      if (paymentResult.redirectUrl) {
        order.bkashURL = paymentResult.redirectUrl; // keep backward compatibility field
        order.payment_url = paymentResult.redirectUrl;
      }
      await order.save();
    }

    // For COD or immediate offline orders, trigger confirmation email immediately
    if (paymentMethod === "cod" || paymentResult?.isImmediate) {
      if (order.email || body.email) {
        sendOrderConfirmationEmail(order).catch((err) =>
          console.error("sendOrderConfirmationEmail error:", err.message)
        );
      }
    }

    return NextResponse.json({
      message: "Order created successfully",
      success: true,
      payment_url: paymentResult?.redirectUrl || null,
      order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}


async function updateProductStock(items, session) {
  for (const item of items) {
    const product = await Product.findById(item.id).session(session);
    if (!product) {
      throw new Error(`Product with ID ${item.id} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }
    product.stock -= item.quantity;
    product.sold_out += item.quantity;
    await product.save({ session });
  }
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
