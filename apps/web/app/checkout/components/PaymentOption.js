import React from "react";

export default function PaymentOption({ id, value, label, checked }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="radio"
        name="payment"
        id={id}
        defaultChecked={checked}
        value={value}
        className="w-5 h-5 text-blue-600"
      />
      <label htmlFor={id} className="text-gray-700">
        <span className="text-lg font-semibold">{label}</span>
      </label>
    </div>
  );
}
