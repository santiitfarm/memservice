import Image from "next/image";
import Link from "next/link";

const initialsOf = (title = "") =>
  title
    .split(/s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function SliderProductCart({ cartData }) {
  return (
    <Link
      href={`/shop?manufacturer=${encodeURIComponent(cartData?.title ?? "")}`}
      className="group/brand flex flex-col items-center gap-3 text-deep-sea-blue transition-colors duration-300 hover:text-sky-blue"
    >
      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-light-mist bg-white p-5 transition-shadow duration-300 group-hover/brand:shadow-md sm:h-40">
        {cartData?.logo ? (
          <Image
            className="h-full w-full object-contain"
            src={cartData.logo}
            width={400}
            height={400}
            alt={cartData?.title ?? "Brand"}
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-light-mist text-2xl font-bold text-sky-blue">
            {initialsOf(cartData?.title)}
          </span>
        )}
      </div>
      <p className="max-w-full truncate text-sm font-semibold capitalize">
        {cartData?.title}
      </p>
    </Link>
  );
}

export default SliderProductCart;
