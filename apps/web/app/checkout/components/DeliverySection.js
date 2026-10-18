import DeliveryOption from "./DeliveryOption";

const DeliverySection = ({
  deliveryCharges,
  selectedDeliveryArea,
  onDeliveryAreaChange,
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">Delivery Area</h2>
      <div className="space-y-3">
        {Object.entries(deliveryCharges).map(([area, charge]) => (
          <DeliveryOption
            key={area}
            area={area}
            charge={charge}
            selected={selectedDeliveryArea === area}
            onChange={() => onDeliveryAreaChange(area)}
          />
        ))}
      </div>
    </div>
  );
};

export default DeliverySection;
