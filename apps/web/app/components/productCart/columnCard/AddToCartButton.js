//import rect icon
import { PiShoppingCartSimple } from "react-icons/pi";
function AddToCartButton({ productData }) {
  return (
    <button className="w-full h-full py-2 flex gap-2 items-center justify-center text-base font-semibold text-deep-sea-blue hover:text-white bg-light-mist hover:bg-deep-sea-blue transition-all duration-300 rounded-full">
      <span>
        <PiShoppingCartSimple />
      </span>
      <span>Add to cart</span>
    </button>
  );
}

export default AddToCartButton;
