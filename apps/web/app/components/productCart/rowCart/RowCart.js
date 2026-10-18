import Image from "next/image";
import Link from "next/link";
function RowCart({ productData }) {
  return (
    <div className="relative group flex items-center gap-3 transition-all duration-300 hover:shadow-md rounded-lg overflow-hidden">
      <Link
        href={`/product/${productData?.id}`}
        className="overflow-hidden bg-soft-lavender max-w-32"
      >
        <Image
          className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110"
          src={productData?.image}
          width={400}
          height={400}
          alt=""
        />
      </Link>
      <div className="flex flex-col gap-1 justify-between">
        <p className="capitalize text-xs text-sky-blue font-medium">
          {productData?.manufacturer_name && (
            <Link href={`shop?manufacturer=${productData?.manufacturer_name}`}>
              {productData?.manufacturer_name}
            </Link>
          )}
        </p>

        <Link
          className="text-xs sm:text-sm md:text-base font-bold text-deep-sea-blue transition-all duration-300 hover:text-sky-blue"
          href={`/product/${productData?.id}`}
        >
          {productData?.title}
        </Link>

        <p className="text-xs sm:text-sm md:text-base font-bold text-deep-sea-blue flex items-center gap-2">
          {productData?.oldPrice && (
            <del className="text-gray-400">${productData?.oldPrice}</del>
          )}
          {productData?.discount && <span>${productData?.discount}</span>}
        </p>
      </div>
    </div>
  );
}

export default RowCart;
