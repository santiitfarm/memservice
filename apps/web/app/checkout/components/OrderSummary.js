import Link from "next/link";
import OrderSummaryItem from "./OrderSummaryItem";
import { ShoppingBasket } from "lucide-react";

const OrderSummary = ({
  productList,
  deliveryCharges,
  selectedDeliveryArea,
  totalAmount,
  isLoading,
  error,
}) => {
  return (
    <div className="lg:w-2/6 border border-gray-200 p-3">
      {productList.length > 0 ? (
        <>
          <div className="rounded-lg">
            <h2 className="text-2xl font-bold mt-5 lg:mt-0 mb-4 text-[#184363]">
              Your order
            </h2>
            <div className="grid grid-cols-2 p-3 font-semibold text-gray-700">
              <div>Product</div>
              <div className="text-right font-bold">Subtotal</div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {productList.map((product) => (
                <OrderSummaryItem key={product.id} product={product} />
              ))}
              <div className="p-3 grid grid-cols-2 border-b font-medium">
                <div className="font-bold">Delivery Charge</div>
                <div className="text-right text-[#56778F]">
                  ৳{deliveryCharges[selectedDeliveryArea].toFixed(2)}
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 font-bold">
                <div>Total</div>
                <div className="text-right text-lg text-[#56778F]">
                  ৳{totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="text-white py-[9px] px-4 mt-5 bg-[#F2971F] rounded-full font-bold text-[15px]"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </>
      ) : (
        <div className="text-center flex flex-col justify-center">
          <p className="text-red-500 bg-red-200 py-2 rounded-md text-center mt-2">
            Please add at least one product to your cart!
          </p>
          <Link
            className="text-white py-[9px] px-4 mt-5 bg-[#F2971F] rounded-full font-bold text-[15px] inline-flex items-center justify-center gap-2"
            href="/shop"
          >
            <ShoppingBasket />
            Go To Shop
          </Link>
        </div>
      )}
      {error && (
        <p className="text-red-500 bg-red-200 py-2 rounded-md text-center mt-2">
          {error}
          <br />
          <span className="text-black">
            Please call<a href="tel:01711-655686">01711-655686</a> number to
            know the availability of this product.
          </span>
        </p>
      )}
    </div>
  );
};
export default OrderSummary;
