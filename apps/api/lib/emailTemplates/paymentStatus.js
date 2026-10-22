import { getCompanyInfo, wrapEmailHtml } from "./baseLayout.js";

export async function renderPaymentReceivedEmail(order, transaction = {}) {
  const company = await getCompanyInfo();

  const customerName =
    order.customer_name || order.customer?.customer_name || "Valued Customer";
  const orderNumber = order.order_number || String(order._id);
  const amount = Number(transaction.amount || order.total_amount || 0).toLocaleString();
  const trxID = transaction.trxID || transaction.transaction_id || order.payment_info?.transaction_id || "N/A";
  const method = (transaction.provider || order.payment_info?.provider || "MFS").toUpperCase();

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #059669; font-weight: 700;">Payment Received! 💳</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Dear <strong>${customerName}</strong>, we have successfully verified your payment of <strong>৳${amount}</strong> for Order <strong>#${orderNumber}</strong>.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" role="presentation">
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Order:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">#${orderNumber}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Amount Paid:</td>
          <td align="right" style="font-size: 14px; font-weight: 700; color: #059669; padding-bottom: 8px;">৳${amount}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">Method:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #0f172a; padding-bottom: 8px;">${method}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748b;">Transaction ID:</td>
          <td align="right" style="font-size: 13px; font-weight: 600; color: #15a9e3;">${trxID}</td>
        </tr>
      </table>
    </div>

    <center>
      <a href="${company.website}/account" class="btn">View Order Status</a>
    </center>
  `;

  const html = wrapEmailHtml({
    title: `Payment Received for Order #${orderNumber} - ${company.name}`,
    preheader: `Payment of ৳${amount} received for Order #${orderNumber}. TrxID: ${trxID}.`,
    contentHtml,
    company,
  });

  const text = `
Payment Received!
Dear ${customerName},
Payment of ৳${amount} for Order #${orderNumber} has been verified.
TrxID: ${trxID} (${method})
Thank you for choosing ${company.name}.
  `.trim();

  return { html, text, subject: `Payment Confirmed: ৳${amount} for Order #${orderNumber}` };
}

export async function renderPaymentFailedEmail(order, reason = "") {
  const company = await getCompanyInfo();

  const customerName =
    order.customer_name || order.customer?.customer_name || "Valued Customer";
  const orderNumber = order.order_number || String(order._id);
  const amount = Number(order.total_amount || 0).toLocaleString();

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #dc2626; font-weight: 700;">Payment Unsuccessful ⚠️</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Dear <strong>${customerName}</strong>, we were unable to process your payment of <strong>৳${amount}</strong> for Order <strong>#${orderNumber}</strong>.
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin-bottom: 24px; color: #991b1b; font-size: 13px;">
      ${reason ? `<strong>Reason:</strong> ${reason}` : "The transaction was declined by your payment provider or cancelled by user."}
    </div>

    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Don't worry, your cart items are safe. You can retry with another payment method or choose Cash on Delivery.
    </p>

    <center>
      <a href="${company.website}/checkout" class="btn">Retry Payment</a>
    </center>
  `;

  const html = wrapEmailHtml({
    title: `Payment Failed for Order #${orderNumber} - ${company.name}`,
    preheader: `We were unable to complete payment for Order #${orderNumber}.`,
    contentHtml,
    company,
  });

  const text = `
Payment Failed for Order #${orderNumber}.
Dear ${customerName}, payment of ৳${amount} could not be processed.
Please visit ${company.website}/checkout to retry.
Hotline: ${company.phone}
  `.trim();

  return { html, text, subject: `Payment Failed for Order #${orderNumber} - ${company.name}` };
}

const paymentStatus = {
  renderPaymentReceivedEmail,
  renderPaymentFailedEmail,
};

export default paymentStatus;
