import CheckoutForm from "./components/CheckoutForm";

export const metadata = {
  title: "Secure Checkout | Mem Service",
  description: "Complete your online medicine order with fast delivery across Bangladesh.",
};

export default async function CheckoutPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const product = resolvedParams?.product;

  return (
    <section className="container mx-auto px-3 lg:px-6 py-6 md:py-10">
      <CheckoutForm product={product} />
    </section>
  );
}
