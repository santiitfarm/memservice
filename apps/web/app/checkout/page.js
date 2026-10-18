import CheckoutForm from "./components/CheckoutForm";
import { use } from "react";
const CheckoutPage = ({ searchParams }) => {
  const searchParam = use(searchParams);
  const product = searchParam.product;

  return (
    <section className="container mx-auto px-6">
      <CheckoutForm product={product} />
    </section>
  );
};

export default CheckoutPage;
