import Image from "next/image";
import PaymentOption from "./PaymentOption";
import DeliverySection from "./DeliverySection";

const PaymentSection = ({
  deliveryCharges,
  selectedDeliveryArea,
  setSelectedDeliveryArea,
}) => {
  return (
    <div className="lg:w-2/6 p-3 border border-gray-200">
      <h1 className="text-2xl mb-4 text-[#184363] font-bold">
        Payment Methods
      </h1>
      <div className="space-y-6">
        <PaymentOption
          id="cod"
          value="cod"
          label="Cash on Delivery"
          checked={true}
        />
        <div>
          <h3 className="text-lg font-semibold mb-2">Online Payments</h3>
          <div className="flex flex-wrap gap-4">
            <PaymentOption
              id="bkash"
              value="bkash"
              label={
                <Image
                  width={100}
                  height={100}
                  src="/assets/logo/bkash.png"
                  alt="bKash"
                  className="w-20 h-12 object-contain"
                />
              }
            />
          </div>
        </div>
      </div>
      <DeliverySection
        deliveryCharges={deliveryCharges}
        selectedDeliveryArea={selectedDeliveryArea}
        onDeliveryAreaChange={setSelectedDeliveryArea}
      />
    </div>
  );
};

export default PaymentSection;
