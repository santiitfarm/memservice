"use client";
import { useCartContext } from "@/app/context/cartContext";
import React, { useState } from "react";
import BillingForm from "./BillingForm";
import PaymentSection from "./PaymentSection";
import DeliverySection from "./DeliverySection";
import OrderSummary from "./OrderSummary";
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
    setError(null);
    const formData = new FormData(event.target);
    const formValues = Object.fromEntries(formData.entries());

    const clientTotal = Math.round(totalAmount * 100) / 100;
    const idempotencyKey =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const submissionData = {
      customer: {
        customer_name: formValues.name,
        phone_number: formValues.number,
        email: formValues.email,
        address: formValues.address,
      },
      payment_info: {
        method: formValues.payment,
        amount: clientTotal,
      },
      shipping_details: {
        address: formValues.address,
        shipping_method: selectedDeliveryArea,
        shipping_charge: deliveryCharges[selectedDeliveryArea],
      },
      total_amount: clientTotal,
      items: productList.map((product) => {
        const unitPrice = Number(product.price || product.discount || product.regular_price) || 0;
        return {
          id: product.id,
          title: product.title,
          quantity: product.quantity,
          price: unitPrice,
          totalPrice: Math.round(unitPrice * product.quantity * 100) / 100,
        };
      }),
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(submissionData),
        }
      );
      setLoading(false);
      const data = await response.json();

      if (response.status === 409 && data.code === "PRICE_CHANGED") {
        setError(
          data.message ||
            `Prices or delivery fee updated (New Total: ৳${data.total}). Please review your order.`
        );
        return;
      }

      if (data?.success) {
        productList.forEach((item) => {
          removeCart(item.id);
        });
        localStorage.removeItem("memservice");

        if (submissionData.payment_info.method !== "cod" && data.payment_url) {
          router.push(data.payment_url);
        } else {
          router.push("/complete-order?order_id=" + (data?.order?._id || data?.order?.id));
        }
      } else {
        setError(data?.message || "Failed to place order. Please try again.");
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
