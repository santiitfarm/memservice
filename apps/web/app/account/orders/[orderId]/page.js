import React from "react";

import Print from "./Print";
import { VoucherTemplateOrder } from "@/utils/VoucherTemplate";

export default async function OrderView({ params }) {
  const { orderId } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/order/${orderId}`
  );
  const data = await res.json();

  return (
    <div className="">
      <div className="flex gap-2 items-center justify-center  ">
        <Print orderData={data.order} />

        {/* <button className="flex gap-2 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <DownloadCloud /> Download PDF
        </button> */}
      </div>
      <div
        className="flex flex-col items-center justify-center space-y-4 container mx-auto md:px-20"
        dangerouslySetInnerHTML={{
          __html: VoucherTemplateOrder(data.order),
        }}
      />
    </div>
  );
}
