export function transformProductData(product) {
  const originalPrice = Number(product?.original_price || product?.regular_price) || 0;
  const discountPrice = Number(product?.discount_price) || 0;
  const currentPrice = discountPrice > 0 ? discountPrice : originalPrice;

  return {
    image: product?.images && product.images[0], // Use the first image
    name: product.model,
    title: `${product.model} ${product.ram}/${product.storage} ${product.region}`,
    rating: "5", // Default rating since no reviews are present
    currentPrice,
    oldPrice: originalPrice,
    discount: discountPrice,
    regular_price: originalPrice,
    discount_price: discountPrice,
    soldOut: product.stock === 0,
    filters: [
      {
        filterName: "model",
        value: product.model,
      },
      {
        filterName: "stock",
        value: product.stock <= 2 ? "low-stock" : "in-stock",
      },
      {
        filterName: "storage",
        value: product.storage,
      },
      {
        filterName: "brand",
        value: product?.brand?.toLowerCase(),
      },
    ],
    url: `/product/${product._id}`,
    id: product._id,

    brand: product?.brand,
    model: product.model,
    ram: product.ram,
    storage: product.storage,
    region: product.region,
    stock: product.stock,
    color: product.color,
    warrantyStatus: product.warrantyStatus,

  };
}
