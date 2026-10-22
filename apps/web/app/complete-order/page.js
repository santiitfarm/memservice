import { getSiteBootstrap } from "@/lib/cms";
import Link from "next/link";
import Print from "../account/orders/[orderId]/Print";
import OrderCancel from "./components/OrderCancel";
import { ShoppingBag, Printer, Download, CheckCircle } from "lucide-react";

export default async function OrderCompletePage({ params, searchParams }) {
  const query = await searchParams;
  const orderId = query.order_id;
  const transactionStatus = query?.transactionStatus;

  const [bootstrap, res] = await Promise.all([
    getSiteBootstrap(),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/order/${orderId}`,
      {
        headers: {
          "X-Website-Origin": "true",
        },
      }
    ),
  ]);
  const data = await res.json();
  const site = bootstrap?.site || {};

  if (data?.order?.status == "cancelled") {
    return <OrderCancel order_no={data?.order?.order_number} phone={site?.contact?.phone} />;
  }
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg">
        <div className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600">Order Complete!</h1>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <p className="text-center text-gray-600 text-lg">
            Thank you for your purchase. Your order has been successfully
            processed.
          </p>

          <div className="bg-gray-100 p-4 rounded-lg space-y-2">
            <p>
              <strong>Invoice Number:</strong> {data.order.order_number}
            </p>
            <p>
              <strong>Total Amount:</strong> ৳{data.order.payment_info.amount}
            </p>

            <p>
              <strong>Paid Amount:</strong> ৳
              {data.order.payment_info.transaction_amount || 0}
            </p>
            {
              <>
                {data.order.payment_info.transaction_number && (
                  <p>
                    <strong>Transaction Phone Number:</strong>{" "}
                    {data.order.payment_info.transaction_number || "N/A"}
                  </p>
                )}
                {data.order.payment_info.transaction_id && (
                  <p>
                    <strong>Transaction ID:</strong>{" "}
                    {data.order.payment_info.transaction_id || "N/A"}
                  </p>
                )}
                <p>
                  <strong>Transaction Status:</strong>{" "}
                  <span className="text-green-600 font-semibold capitalize">
                    {data.order.payment_info.status || "Unpaid"}
                  </span>
                </p>
              </>
            }
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              A confirmation email has been sent to your registered email
              address.
            </p>
            <p>Please keep this information for your records.</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Print orderData={data.order} />

          {/* <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </button> */}

          <Link href="/shop" className="w-full sm:w-auto">
            <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
