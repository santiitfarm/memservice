import { getCompanyInfo, wrapEmailHtml } from "./baseLayout.js";

export async function renderOrderShippedEmail(order, shipment = {}) {
  const company = await getCompanyInfo();

  const customerName =
    order.customer_name || order.customer?.customer_name || "Valued Customer";
  const orderNumber = order.order_number || String(order._id);
  const courierName = shipment.courier || shipment.courierName || "Express Courier";
  const consignmentId = shipment.consignmentId || shipment.trackingId || "N/A";
  const trackingUrl =
    shipment.trackingUrl ||
    `${company.website}/account/orders/${order._id}`;

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-weight: 700;">Your Order is on the Way! 🚚</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Hello <strong>${customerName}</strong>, great news! Your order <strong>#${orderNumber}</strong> has been carefully packed and handed over to our courier partner for delivery.
    </p>

    <!-- Shipment Details Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" role="presentation">
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Order:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Courier Partner:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">${courierName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b;">Consignment / Tracking ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #15a9e3;">${consignmentId}</td>
        </tr>
      </table>
    </div>

    <center>
      <a href="${trackingUrl}" class="btn" target="_blank">Track Shipment Live</a>
    </center>

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
      Please ensure someone is available at the delivery location to receive the package and inspect the security seal upon arrival.
    </p>
  `;

  const html = wrapEmailHtml({
    title: `Order #${orderNumber} Shipped - ${company.name}`,
    preheader: `Your order #${orderNumber} has shipped via ${courierName}. Tracking ID: ${consignmentId}.`,
    contentHtml,
    company,
  });

  const text = `
Order #${orderNumber} has been shipped!
Courier: ${courierName}
Consignment ID: ${consignmentId}
Track: ${trackingUrl}
${company.name} Hotline: ${company.phone}
  `.trim();

  return { html, text, subject: `Your order #${orderNumber} has shipped! - ${company.name}` };
}

export default renderOrderShippedEmail;
