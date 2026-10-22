import ColumnCard from "@/app/components/productCart/columnsCart/ColumnCard";

const Products = ({
  productData,
  sort,
  categories,
  manufacturer,
  productType,
}) => {
  const getSortedProducts = () => {
    let filteredData = [...productData];

    if (categories && categories.length > 0) {
      filteredData = filteredData.filter((product) =>
        categories.some((cat) =>
          product.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    if (manufacturer && manufacturer.length > 0) {
      filteredData = filteredData.filter((product) =>
        manufacturer.some((manu) =>
          product.manufacturer_name.toLowerCase().includes(manu.toLowerCase())
        )
      );
    }

    if (productType && productType.length > 0) {
      filteredData = filteredData.filter((product) =>
        productType.some((type) =>
          product.product_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    if (sort === "new") {
      return filteredData.sort((a, b) => b.is_new - a.is_new);
    }

    if (sort === "lowToHigh") {
      return filteredData.sort(
        (a, b) => (Number(a.discount || a.currentPrice) || 0) - (Number(b.discount || b.currentPrice) || 0)
      );
    }

    if (sort === "highToLow") {
      return filteredData.sort(
        (a, b) => (Number(b.discount || b.currentPrice) || 0) - (Number(a.discount || a.currentPrice) || 0)
      );
    }

    if (sort === "popularity") {
      return filteredData.sort((a, b) => {
        const aPopularity = a.soldOut >= 15 ? 1 : 0;
        const bPopularity = b.soldOut >= 15 ? 1 : 0;
        return bPopularity - aPopularity;
      });
    }

    return filteredData;
  };

  const sortedProducts = getSortedProducts();

  return (
    <main className="container mx-auto mt-6">
      {/* Product Cards */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
          {sortedProducts.map((product, ind) => (
            <div key={ind}>
              <ColumnCard productData={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center flex-col gap-4 mt-20">
          <span className="bg-slate-100 p-7 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#49c5ee"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-shopping-cart"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </span>
          <h2 className="text-center text-2xl font-bold text-deep-sea-blue">
            Sorry! No Product Founds
          </h2>
          <span>Please try searching for something else</span>
        </div>
      )}
    </main>
  );
};

export default Products;
