import bkashAdapter from "./integrations/payments/bkash";

export async function createPayment(amount, merchantInvoiceNumber, payerReference) {
  const result = await bkashAdapter.createPayment({
    total_amount: amount,
    order_number: merchantInvoiceNumber,
    phone_number: payerReference,
  });

  return {
    statusCode: "0000",
    statusMessage: "Successful",
    paymentID: result.paymentID,
    bkashURL: result.redirectUrl,
    merchantInvoiceNumber: result.merchantInvoiceNumber,
    ...result.raw,
  };
}

export async function executePayment(paymentID) {
  const result = await bkashAdapter.executeOrVerify({ paymentID, status: "success" });

  if (result.success) {
    return {
      statusCode: "0000",
      statusMessage: "Successful",
      paymentID: result.paymentID,
      trxID: result.trxID,
      transactionStatus: "Completed",
      amount: String(result.amount),
      customerMsisdn: result.payerNumber || "",
      merchantInvoiceNumber: result.merchantInvoiceNumber,
      currency: result.currency || "BDT",
      ...result.raw,
    };
  }

  return {
    statusCode: "2068",
    statusMessage: result.reason || "Execution failed",
    ...result.raw,
  };
}

const bkashLegacy = {
  createPayment,
  executePayment,
};

export default bkashLegacy;

