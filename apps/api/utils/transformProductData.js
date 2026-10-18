export function transformProductData(product) {
  return {
    image: product?.images && product.images[0], // Use the first image
    name: product.model,
    title: product.name,
    rating: "5", // Default rating since no reviews are present
    currentPrice:
      product.discount_price == 0
        ? product.regular_price
        : product.discount_price,
    oldPrice: product.regular_price,
    discount: product.discount_price == 0 ? 0 : product.discount_price,
    soldOut: product.sold_out,
    filters: [
      {
        filterName: "category",
        value: product?.category?.categoryName,
      },
      {
        filterName: "stock",
        value:
          product.stock === 0
            ? "out-of-stock"
            : product.stock <= 2
            ? "low-stock"
            : "in-stock",
      },
      {
        filterName: "brand",
        value: product?.brand?.title,
      },
    ],
    url: `/product/${product._id}`,
    id: product._id,
    brand: product?.brand.title,
    manufacturer_name: product?.manufacturer_name,
    product_type: product?.products_type,
    generic_name: product?.generic_name,
    special_tag: product?.special_tag,
    tags: product?.tags,
    category: product?.category.categoryName,
    stock: product?.stock,
    is_new: product?.is_new,
    is_offer: product?.is_offer,
    best_seller: product?.best_seller,
    is_trending: product?.is_trending,
  };
}
