import Product from "@/app/models/product-model";
import StockMovement from "@/app/models/StockMovement";
import { sendMail } from "@/lib/mailer";

/** Cancels an order: returns the stock, saves the new status and notifies the customer. */
export async function cancelOrder(order, payment_info) {
  await restockItems(order.items, order.order_number);

  order.status = "cancelled";
  if (payment_info) {
    order.payment_info = payment_info;
  }
  await order.save();

  await sendCancellationEmail(order);
  return order;
}

async function restockItems(items, orderNumber = "") {
  for (const item of items) {
    if (!item.id || !item.quantity) {
      throw new Error("Invalid product details in order");
    }
    const product = await Product.findById(item.id);
    if (!product) {
      throw new Error(`Product not found for ID: ${item.id}`);
    }
    product.stock += item.quantity;
    product.sold_out -= item.quantity;
    await product.save();

    await StockMovement.create({
      product: product._id,
      variantSku: item.variantSku || null,
      delta: item.quantity,
      reason: "cancel",
      reference: orderNumber ? `Order #${orderNumber} cancelled` : "Order cancelled",
      balanceAfter: product.stock,
      by: null,
      at: new Date(),
    });
  }
}

async function sendCancellationEmail(order) {
  if (!order?.customer?.email) {
    console.log("No email address available");
    return;
  }
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleString("en-US", {
    timeZone: "Asia/Dhaka", // Explicitly set Bangladesh timezone
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const mailOptions = {
    to: order.customer.email,
    subject: `Order Cancellation for #${order.order_number}!`,
    html: `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Cancellation Confirmation</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #f0f4f8;
                        }
                        .container {
                            background-color: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                            color: white;
                            text-align: center;
                            padding: 20px;
                        }
                        .content {
                            padding: 25px;
                        }
                        .order-details {
                            background-color: #f1f5f9;
                            border-left: 4px solid #2575fc;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background-color: #e2e8f0;
                            text-align: center;
                            padding: 15px;
                            font-size: 0.9em;
                            color: #4a5568;
                        }
                        .cta-button {
                            display: inline-block;
                            border:1px solid #2575fc;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 15px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Order Cancellation Confirmed</h1>
                        </div>
                        
                        <div class="content">
                            <p>Hi ${order.customer?.customer_name},</p>
                            
                            <p>Your order has been successfully cancelled.</p>
                            
                            <div class="order-details">
                                <h3>Order Summary</h3>
                                <p><strong>Order #:</strong> ${
                                  order.order_number
                                }</p>
                                <p><strong>Order Date:</strong> ${formattedDate}</p>
                                <p><strong>Total Amount:</strong> ${
                                  order.total_amount
                                }</p>
                                <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>
                            
                            <p>If you have any questions or concerns, please do not hesitate to contact us.</p>
                            
                            <a href="tel:+8801711655686" class="cta-button">Contact Support</a>
                        </div>
                        
                        <div class="footer">
                            © ${new Date().getFullYear()} Mem Service BD • All Rights Reserved
                        </div>
                    </div>
                </body>
                </html>
    `,
  };

  const result = await sendMail(mailOptions);
  if (result.ok) console.log(`Cancellation email sent to ${order.customer.email}`);
}
