"use client";

import AddToCartButton from "@/app/components/productCart/columnsCart/AddToCartButton";
import WishlistButton from "@/app/components/productCart/columnsCart/wishlistButton";
import SocialIcons from "@/app/components/SocialIcons";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function ShowProductDetails({ product, url }) {
  const socialLinks = {
    image: product?.images?.[0] || "",
    title: product?.name,
    des: product?.short_description,
    url: url,
  };

  const router = useRouter();
  const [productQuantity, setProductQuantity] = useState(1);

  const handleIncrease = () => {
    setProductQuantity((prev) => prev + 1);
  };
  const handleDecrease = () => {
    setProductQuantity((prev) => prev - 1);
  };

  const mappedProduct = {
    stock: product?.stock,
    id: product?._id,
    title: product?.name,
    image: product?.images?.[0] || "",
    purchase_price: product?.purchase_price,
    discount: product?.discount_price,
    regular_price: product?.regular_price,
    quantity: productQuantity,
    manufacturer_name: product?.manufacturer_name,
    name: product?.name,
    generic_name: product?.generic_name,
  };

  const handleBuyNow = () => {
    const query = JSON.stringify(mappedProduct);
    router.push(`/checkout?product=${query}`);
  };

  return (
    <section>
      <div>
        <h1 className="font-semibold text-2xl relative">
          {product?.name}

          <span className="text-[#15a9e3] font-bold text-xs  px-2 py-1 rounded-full absolute top-0 ml-1 ">
            {product?.special_tag || "N/A"}
          </span>
        </h1>
        <div className="my-2 text-sm flex flex-row gap-3">
          <p>
            <span className="text-[#15a9e3] font-bold">Menufacturer:</span>{" "}
            {product?.manufacturer_name || "Unknown"}
          </p>
          <p>
            <span className="text-[#15a9e3] font-bold">Category:</span>{" "}
            {product?.category?.categoryName || "N/A"}
          </p>
        </div>
        <hr className="w-full my-3" />
        <ul>
          {product?.product_features?.map((feature, index) => (
            <li className="mt-1 pt-2 text-sm" key={index}>
              <span className="text-green-600 mr-3">✔</span>
              {feature}
            </li>
          ))}
        </ul>
        <hr className="w-full my-3" />
        <div className="flex gap-3 items-center my-4">
          {product?.regular_price && <del>৳{product?.regular_price}</del>}
          {product?.discount_price && (
            <span className="text-[#15a9e3] text-2xl">
              ৳{product?.discount_price}
            </span>
          )}
        </div>

        <div className="p-4 bg-light-mist text-white rounded-lg w-full">
          <div className="flex flex-col xl:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                disabled={productQuantity === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  productQuantity >= 2
                    ? "bg-deep-sea-blue"
                    : "bg-gray-300 hover:bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Minus />
              </button>
              <span className="w-40 py-3 bg-white text-deep-sea-blue rounded-full text-center">
                {productQuantity}
              </span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-deep-sea-blue"
              >
                <Plus className="" />
              </button>
            </div>

            {/* Pass the mapped product data */}
            <div className="w-full">
              <AddToCartButton
                productData={mappedProduct}
                productD="productD"
              />
            </div>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full mt-3 flex items-center justify-center px-6 py-2 mx-auto space-x-2 text-white bg-sunset-orange rounded-full"
          >
            <ShoppingCart className="" />
            <span>Buy now</span>
          </button>
        </div>

        <div className="flex items-center justify-start gap-5 mt-5">
          <button className="hover:text-[#15a9e3] text-sm flex items-center">
            <div className="flex justify-between items-center">
              <WishlistButton productData={mappedProduct} />

              <span>Add to wishlist</span>
            </div>
          </button>
          <button className="hover:text-[#15a9e3] text-sm flex items-center">
            <div className="flex justify-between items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#15a9e3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mail"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <Link href={"/consultation/doctor"} className="ml-2">
                Ask about product
              </Link>
            </div>
          </button>
        </div>
        <SocialIcons socialLinks={socialLinks} product={product} />
      </div>
    </section>
  );
}

export default ShowProductDetails;
