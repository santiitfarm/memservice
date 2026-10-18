"use client";
import { useCartContext } from "@/app/context/cartContext";
import React, { useState } from "react";
import BillingForm from "./BillingForm";
import PaymentSection from "./PaymentSection";
import DeliverySection from "./DeliverySection";
import OrderSummary from "./OrderSummary";
import { generateOrderNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ product }) {
  const { cart, removeCart } = useCartContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const products = product ? JSON.parse(product) : cart;
  const productList = Array.isArray(products) ? products : [products];
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState("Dhaka");
  const deliveryCharges = {
    Dhaka: 60,
    "Outside Dhaka": 90,
    "All Bangladesh": 120,
  };
  const totalAmount =
    productList.reduce(
      (total, product) => total + product.discount * product.quantity,
      0
    ) + deliveryCharges[selectedDeliveryArea];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const formValues = Object.fromEntries(formData.entries());
    const submissionData = {
      customer: {
        customer_name: formValues.name,
        phone_number: formValues.number,
        email: formValues.email,
        address: formValues.address,
      },
      payment_info: {
        method: formValues.payment,
        amount: totalAmount.toFixed(2),
      },
      shipping_details: {
        address: formValues.address,
        shipping_method: selectedDeliveryArea,
        shipping_charge: deliveryCharges[selectedDeliveryArea],
      },
      total_amount: totalAmount.toFixed(2),
      order_number: generateOrderNumber("KST"),
      items: productList.map((product) => ({
        id: product.id,
        title: product.title,
        quantity: product.quantity,
        price: product.discount,
        totalPrice: (product.discount * product.quantity).toFixed(2),
      })),
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );
      setLoading(false);
      const data = await response.json();
      console.log(data);
      if (data?.success) {
        setLoading(false);
        productList.forEach((item) => {
          removeCart(item.id);
        });
        localStorage.removeItem("memservice", JSON.stringify(cart));
        if (submissionData.payment_info.method !== "cod") {
          console.log("payment url", data);
          router.push(data.payment_url);
        } else {
          if (submissionData.payment_info.method === "cod") {
            router.push("/complete-order?order_id=" + data?.order?._id);
          } else {
            console.log("complete order", data);
            // router.push("/complete-order?orderId=" + submissionData.order_number);
          }
        }
        router.push(data?.payment_url);
        //   router.push("/complete-order?order_id=" + data?.order?._id);
      } else {
        setLoading(false);
        setError(data?.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting the order:", error);
    }
  };

  return (
    <section className="container mx-auto px-6">
      <form
        className="flex flex-col lg:flex-row lg:gap-5"
        onSubmit={handleSubmit}
      >
        <BillingForm />
        <PaymentSection
          deliveryCharges={deliveryCharges}
          selectedDeliveryArea={selectedDeliveryArea}
          setSelectedDeliveryArea={setSelectedDeliveryArea}
        />

        <OrderSummary
          productList={productList}
          deliveryCharges={deliveryCharges}
          selectedDeliveryArea={selectedDeliveryArea}
          totalAmount={totalAmount}
          isLoading={loading}
          error={error}
        />
      </form>
    </section>
  );
}
