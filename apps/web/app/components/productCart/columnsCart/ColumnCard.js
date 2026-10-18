import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./wishlistButton";

function ColumnCard({ productData }) {
  return (
    <section className="relative group transition-all duration-300 hover:shadow-md rounded-lg overflow-hidden">
      {/* Product Cart Image  */}
      <div className="w-full h-full max-h-[300px] bg-soft-lavender p-4 overflow-hidden">
        <Link href={`/product/${productData?.id}`}>
          <Image
            className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110"
            src={productData?.image}
            width={400}
            height={400}
            alt=""
          />
        </Link>
      </div>

      <div className="absolute -left-2 top-3">
        {productData?.special_tag && (
          <p className="px-3 py-1 text-xs font-medium text-white bg-fresh-green rounded-r-full">
            {productData?.special_tag}
          </p>
        )}
      </div>

      <div className="absolute top-3 right-3 text-sky-blue rounded-full">
        <WishlistButton productData={productData} />
      </div>

      <div className="flex flex-col gap-1 p-2">
        <p className="capitalize text-xs text-sky-blue font-medium">
          {productData?.manufacturer_name && (
            <Link href={`shop?manufacturer=${productData?.manufacturer_name}`}>
              {productData?.manufacturer_name}
            </Link>
          )}
        </p>
        <p className="line-clamp-1 text-xs sm:text-sm md:text-base font-semibold text-deep-sea-blue transition-all duration-300 hover:text-sky-blue">
          {productData?.title && (
            <Link href={`/product/${productData?.id}`}>
              {productData?.title}
            </Link>
          )}
        </p>
        <p className="flex items-center gap-3 text-xs sm:text-sm md:text-base font-bold text-deep-sea-blue">
          {productData?.oldPrice && (
            <del className="opacity-50">${productData?.oldPrice}</del>
          )}
          {productData?.discount && <span>${productData?.discount}</span>}
        </p>

        <div className="mt-3">
          <AddToCartButton productData={productData} />
        </div>
      </div>
    </section>
  );
}

export default ColumnCard;
