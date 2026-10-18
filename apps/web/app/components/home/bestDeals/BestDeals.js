// import components
import DynamicProductShowcase from "../../DynamicProductShowcase/DynamicProductShowcase";

async function BestDeals() {
  const response = await fetch(
    `${process.env.API_URL}/api/product/best-seller`
  );
  const data = await response.json();
  const productData = data?.bestSellers;

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
