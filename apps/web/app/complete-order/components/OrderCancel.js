import { ShoppingBasket, PhoneCall, ClipboardList } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function OrderCancel({ order_no }) {
  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[75vh] bg-gray-50">
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Order #{order_no} has been Cancelled!
            </h1>
            <p className="mt-2 text-xl text-red-500">Due to Payment Failure!</p>
            <p className="mt-4 text-gray-600">
              Please try again or contact our helpline for assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300"
            >
              <ShoppingBasket className="w-5 h-5" />
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300"
            >
              <ClipboardList className="w-5 h-5" />
              View Order History
            </Link>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Need Help?
            </h3>
            <a
              href="tel:+8801704282029"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-300"
            >
              <PhoneCall className="w-5 h-5" />
              +880 1711655686
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
