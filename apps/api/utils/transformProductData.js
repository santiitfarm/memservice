export function transformProductData(product) {
  const regularPrice = Number(product?.regular_price) || 0;
  const discountPrice = Number(product?.discount_price) || 0;
  const currentPrice = discountPrice > 0 ? discountPrice : regularPrice;

  return {
    image: product?.images && product.images[0], // Use the first image
    name: product.model || product.name,
    title: product.name,
    rating: "5", // Default rating since no reviews are present
    currentPrice,
    oldPrice: regularPrice,
    discount: discountPrice,
    regular_price: regularPrice,
    discount_price: discountPrice,
    purchase_price: Number(product.purchase_price) || 0,
    soldOut: product.sold_out || 0,
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
