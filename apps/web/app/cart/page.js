"use client";
import { useCartContext } from "@/app/context/cartContext";
import Link from "next/link";
import CartCard from "../components/CartCard/CartCard";

const CartPage = () => {
  const { cart, setDecrement, setIncrement, removeCart } = useCartContext();

  const calculateSubtotal = () =>
    cart.reduce((acc, product) => {
      const price = Number(product.price || product.discount || product.regular_price) || 0;
      return acc + price * product.quantity;
    }, 0);

  return (
    <section className="container mx-auto px-3 lg:px-6 flex flex-col mt-0 lg:mt-20 xl:mt-0 xl:flex-row justify-between gap-6">
      {cart.length > 0 ? (
        <div className="w-full xl:w-[70%]">
          <div>
            <div className="w-full">
              <div className="md:grid grid-cols-12 py-2 hidden">
                <p className="col-span-6 text-center font-semibold text-[#184363]">
                  Product
                </p>
                <p className="col-span-2 text-center font-semibold text-[#184363]">
                  Price
                </p>
                <p className="col-span-2 text-center font-semibold text-[#184363]">
                  Quantity
                </p>
                <p className="col-span-2 text-center font-semibold text-[#184363]">
                  Subtotal
                </p>
              </div>
              <div className="flex flex-col border-2 border-gray-200 rounded-md">
                {cart.map((product) => (
                  <CartCard
                    key={product.id}
                    product={product}
                    setDecrement={setDecrement}
                    setIncrement={setIncrement}
                    removeCart={removeCart}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full lg:w-3/4 flex items-center justify-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
        </div>
      )}

      <div className="w-full xl:w-[30%] text-deep-sea-blue">
        <h2 className=" py-2 font-semibold ">Cart totals</h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <span className=" font-medium">Subtotal</span>
              <span className=" font-medium">
                ৳{calculateSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className=" font-medium">Total</span>
              <span className=" font-medium text-lg">
                ৳{calculateSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2 mt-2 xl:flex-col items-center">
              {cart.length > 0 ? (
                <button className="w-full bg-[#F6A429] hover:bg-[#184363] text-white font-semibold h-10 rounded-2xl">
                  <Link href="/checkout">Proceed to checkout</Link>
                </button>
              ) : (
                <button
                  className="w-full disabled:cursor-not-allowed bg-[#F6A429] hover:bg-[#184363] text-white font-semibold h-10 rounded-2xl"
                  disabled
                >
                  Proceed to checkout
                </button>
              )}

              <button className="w-full bg-gray-300 hover:bg-[#184363] text-gray-800 hover:text-white h-10 font-semibold rounded-2xl">
                <Link href={"/shop"}>Continue Shopping</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
