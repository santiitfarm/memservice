// import components
import DynamicProductShowcase from "../../DynamicProductShowcase/DynamicProductShowcase";

async function BestDeals() {
  let productData = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/product/best-seller`);
    if (response.ok) {
      const data = await response.json();
      productData = Array.isArray(data?.bestSellers) ? data.bestSellers : [];
    }
  } catch (err) {
    console.error("Failed to fetch best sellers:", err);
  }

  return (
    <section>
      <DynamicProductShowcase
        productData={productData}
        sectionName={"Best Deals Of The Week"}
        viewAllUrl={"best-seller"}
      />
    </section>
  );
}

export default BestDeals;
