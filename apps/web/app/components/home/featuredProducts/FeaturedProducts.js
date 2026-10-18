// import components
import DynamicProductShowcase from "../../DynamicProductShowcase/DynamicProductShowcase";

async function FeaturedProducts() {
  let productData = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/product/new-arrival`);
    if (response.ok) {
      const data = await response.json();
      productData = Array.isArray(data?.new_products) ? data.new_products : [];
    }
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
  }

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
