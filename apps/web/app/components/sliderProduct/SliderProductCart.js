import Image from "next/image";
import Link from "next/link";

const initialsOf = (title = "") =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export default function SliderProductCart({ cartData }) {
  const brandSlug = cartData?.slug || encodeURIComponent(cartData?.title ?? "");
  const title = cartData?.title || "Brand";

  return (
    <Link
      href={`/shop?brand=${brandSlug}`}
      title={title}
      className="group/brand flex flex-col items-center justify-between h-36 sm:h-40 p-2 text-foreground transition-all duration-300 hover:text-primary select-none cursor-pointer"
    >
      {/* Brand Logo Container (Clean & Borderless, matching reference design) */}
      <div className="flex-1 flex items-center justify-center w-full relative px-2">
        {cartData?.logo ? (
          <div className="relative w-full h-20 sm:h-24 flex items-center justify-center">
            <Image
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/brand:scale-108"
              src={cartData.logo}
              width={180}
              height={90}
              alt={title}
              sizes="(max-width: 640px) 120px, 180px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform duration-300 group-hover/brand:scale-105">
            <span className="text-lg sm:text-xl font-extrabold tracking-wider">
              {initialsOf(title)}
            </span>
          </div>
        )}
      </div>

      {/* Brand Name (Centered directly below logo) */}
      <p className="w-full text-xs sm:text-sm font-semibold text-center text-slate-800 dark:text-slate-100 group-hover/brand:text-primary transition-colors line-clamp-1 mt-2">
        {title}
      </p>
    </Link>
  );
}
