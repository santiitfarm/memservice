// import components
import DynamicProductShowcase from "../../DynamicProductShowcase/DynamicProductShowcase";

async function FeaturedProducts() {
  const response = await fetch(
    `${process.env.API_URL}/api/product/new-arrival`
  );
  const data = await response.json();
  const productData = data?.new_products;

  return (
    <section>
      <DynamicProductShowcase
        productData={productData}
        sectionName={"Featured Products"}
        viewAllUrl={"trending"}
      />
    </section>
  );
}

export default FeaturedProducts;
