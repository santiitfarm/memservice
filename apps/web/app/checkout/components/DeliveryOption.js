import React from "react";

export default function DeliveryOption({ area, charge, selected, onChange }) {
  return (
    <div className="flex items-center gap-3" key={area}>
      <input
        type="radio"
        id={area}
        name="deliveryArea"
        value={area}
        className="w-5 h-5 text-blue-600"
        checked={selected}
        onChange={onChange}
      />
      <label
        htmlFor={area}
        className="text-gray-700 flex justify-between w-full"
      >
        <span>{area}</span>
        <span>{charge} Taka</span>
      </label>
    </div>
  );
}
