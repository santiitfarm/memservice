"use client"

import { useState } from "react";

const Accordion = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const accordionData = [
        {
            title: "Direct bank transfer",
            content: "Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.",
        },
        {
            title: "Check payments",
            content: "Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.",
        },
        {
            title: "Cash on delivery",
            content: "Pay with cash upon delivery.",
        },
    ];

    return (
        <div className=" mt-10 bg-white rounded-md border divide-y divide-gray-200">
            {accordionData.map((item, index) => (
                <div key={index}>
                    <button
                        className="flex justify-center gap-3 items-center p-4 text-left  font-medium hover:bg-gray-50 focus:outline-none"
                        onClick={() => toggleAccordion(index)}
                    >
                        <input type="radio" name="paymentMethod" className="radio" checked={openIndex === index} value={item.title} />
                        <span className="text-[#57778F]">{item.title}</span>
                    </button>
                    {openIndex === index && (
                        <div className="p-2 mx-4 mb-2 text-xs text-[#15A9E3] bg-[#edf4f6] rounded-md">
                            {item.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Accordion;
