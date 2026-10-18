import { MenuProvider } from "../context/menuContext";
import FilterComponents from "./_components/FilterComponents";
import Pagination from "./_components/Pagination";
import Products from "./_components/Products";
import ShopBanner from "./_components/ShopBanner";
import ShopToolBar from "./_components/ShopToolBar";

const ShopPage = async ({ searchParams }) => {
  const response = await fetch(`${process.env.API_URL}/api/shop`);
  const data = await response.json();
  const productData = data?.products;

  const { search, category, manufacturer, productType, sort, page } =
    await searchParams;

  const itemsPerPage = 5;
  const currentPage = page ? parseInt(page) : 1;

  const categories = category ? decodeURIComponent(category).split("|") : [];
  const manufacturers = manufacturer
    ? decodeURIComponent(manufacturer).split("|")
    : [];
  const productTypes = productType
    ? decodeURIComponent(productType).split("|")
    : [];

  const filteredProducts = productData.filter((product) => {
    const searchMatch = search
      ? product.title.toLowerCase().includes(search.toLowerCase())
      : true;

    const categoryMatch =
      categories.length > 0 ? categories.includes(product.category) : true;

    const manufacturerMatch =
      manufacturers.length > 0
        ? manufacturers.includes(product.manufacturer_name)
        : true;

    const productTypeMatch =
      productTypes.length > 0
        ? productTypes.includes(product.product_type)
        : true;

    return (
      searchMatch && categoryMatch && manufacturerMatch && productTypeMatch
    );
  });

  const totalFilteredItems = filteredProducts.length;
  const skip = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(skip, skip + itemsPerPage);

  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const bannerRes = await fetch(`${process.env.API_URL}/api/banner`);
  const banner = await bannerRes.json();
  const banners = banner?.banner;

  return (
    <MenuProvider>
      <main className="container mx-auto px-3 lg:px-6 flex gap-6 mt-6 lg:mt-20 xl:mt-6 relative">
        <FilterComponents
          filterCategories={productData}
          filterManufacturers={productData}
          filterProductTypes={productData}
          categories={categories}
          manufacturers={manufacturers}
          productTypes={productTypes}
        />

        <div className="w-full h-full">
          <ShopToolBar products={productData} />
          <ShopBanner bannerData={banners} />
          <Products
            productData={paginatedProducts}
            sort={sort}
            categories={categories}
            manufacturer={manufacturers}
            productType={productTypes}
          />
          {totalPages > 1 && (
            <Pagination
              totalItems={totalFilteredItems}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              currentPage={currentPage}
            />
          )}
        </div>
      </main>
    </MenuProvider>
  );
};

export default ShopPage;
