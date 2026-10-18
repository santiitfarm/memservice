import RowCart from "../../productCart/rowCart/RowCart";

async function MoreToLove() {
  let trendingProducts = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/product/trending`);
    if (response.ok) {
      const data = await response.json();
      trendingProducts = Array.isArray(data?.trending_products) ? data.trending_products : [];
    }
  } catch (err) {
    console.error("Failed to fetch trending products:", err);
  }

  if (!trendingProducts.length) return null;

  return (
    <main className="container mx-auto px-3 lg:px-6">
      <h3 className="text-xl md:text-2xl font-bold text-deep-sea-blue capitalize text-center">
        More to love
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 lg:mt-14 lg:gap-4">
        {trendingProducts.slice(0, 12).map((product, ind) => (
          <div key={product?._id || ind}>
            <RowCart productData={product} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default MoreToLove;
