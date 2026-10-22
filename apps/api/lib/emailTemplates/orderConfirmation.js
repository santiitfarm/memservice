import { getCompanyInfo, wrapEmailHtml } from "./baseLayout.js";

export async function renderOrderConfirmationEmail(order) {
  const company = await getCompanyInfo();

  const customerName =
    order.customer_name || order.customer?.customer_name || "Valued Customer";
  const orderNumber = order.order_number || String(order._id);
  const totalAmount = Number(order.total_amount || 0).toLocaleString();
  const shippingCharge = Number(
    order.shipping_details?.charge ?? order.shipping_details?.shipping_charge ?? 0
  ).toLocaleString();
  const subtotal = (
    Number(order.total_amount || 0) -
    Number(order.shipping_details?.charge ?? order.shipping_details?.shipping_charge ?? 0)
  ).toLocaleString();

  const zoneLabel =
    order.shipping_details?.zoneLabel ||
    order.shipping_details?.district ||
    "Standard Delivery";
  const eta = order.shipping_details?.eta || "24-48 Hours";
  const paymentMethod = (
    order.payment_info?.provider ||
    order.payment_info?.method ||
    "Cash on Delivery"
  ).toUpperCase();
  const paymentStatus = order.payment_info?.status || "Pending";

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b;">
        <strong>${item.title || item.name}</strong>
        ${item.strength ? `<span style="font-size: 12px; color: #64748b;"> (${item.strength})</span>` : ""}
        <div style="font-size: 12px; color: #64748b;">Qty: ${item.quantity} &times; ৳${Number(item.price).toLocaleString()}</div>
      </td>
      <td align="right" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b;">
        ৳${(Number(item.quantity) * Number(item.price)).toLocaleString()}
      </td>
    </tr>
  `
    )
    .join("");

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-weight: 700;">Order Confirmed! 🎉</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Dear <strong>${customerName}</strong>, thank you for choosing ${company.name}. We have received your order <strong>#${orderNumber}</strong> and our licensed pharmacy team is preparing your package.
    </p>

    <!-- Details Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <table width="100%" role="presentation">
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Order Number:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 6px;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Estimated Delivery:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #15a9e3; padding-bottom: 6px;">${eta}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 6px;">Delivery Zone:</td>
          <td align="right" style="font-size: 13px; font-weight: 500; color: #0f172a; padding-bottom: 6px;">${zoneLabel}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b;">Payment:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a;">${paymentMethod} (${paymentStatus})</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">Items in Your Order</h3>
    <table width="100%" role="presentation" style="margin-bottom: 20px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Subtotal</td>
        <td align="right" style="padding: 8px 0; font-size: 13px; color: #1e293b;">৳${subtotal}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Shipping Charge</td>
        <td align="right" style="padding: 8px 0; font-size: 13px; color: #1e293b;">৳${shippingCharge}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: 700; color: #0f172a;">Total</td>
        <td align="right" style="padding: 12px 0; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 700; color: #15a9e3;">৳${totalAmount}</td>
      </tr>
    </table>

    <!-- Shipping address -->
    <div style="border-left: 3px solid #15a9e3; padding-left: 12px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">Delivery Address</div>
      <div style="font-size: 14px; color: #1e293b; margin-top: 4px;">
        ${order.shipping_details?.address || "Address provided at checkout"}, ${order.shipping_details?.district || ""}
      </div>
      <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Phone: ${order.phone_number || order.customer?.phone_number || ""}</div>
    </div>

    <center>
      <a href="${company.website}/account" class="btn">View Order on Dashboard</a>
    </center>
  `;

  const html = wrapEmailHtml({
    title: `Order #${orderNumber} Confirmed - ${company.name}`,
    preheader: `Thank you for your order #${orderNumber}. Total: ৳${totalAmount}. Estimated delivery: ${eta}.`,
    contentHtml,
    company,
  });

  const text = `
Order #${orderNumber} Confirmed!
Thank you ${customerName} for ordering from ${company.name}.
Total: ৳${totalAmount}
Estimated Delivery: ${eta} (${zoneLabel})
Payment: ${paymentMethod} (${paymentStatus})
Address: ${order.shipping_details?.address || ""}
Hotline: ${company.phone}
  `.trim();

  return { html, text, subject: `Order #${orderNumber} Confirmed - ${company.name}` };
}

export default renderOrderConfirmationEmail;
