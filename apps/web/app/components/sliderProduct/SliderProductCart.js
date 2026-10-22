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

  return (
    <Link
      href={`/shop?brand=${brandSlug}`}
      className="group/brand flex flex-col items-center gap-2.5 text-foreground transition-all duration-300 hover:text-primary"
    >
      <div className="flex h-28 sm:h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 group-hover/brand:shadow-md group-hover/brand:border-primary/40">
        {cartData?.logo ? (
          <Image
            className="h-full w-full object-contain transition-transform duration-300 group-hover/brand:scale-105"
            src={cartData.logo}
            width={240}
            height={120}
            alt={cartData?.title ?? "Brand"}
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-primary">
            {initialsOf(cartData?.title)}
          </span>
        )}
      </div>
      <p className="max-w-full truncate text-xs sm:text-sm font-semibold capitalize text-center">
        {cartData?.title}
      </p>
    </Link>
  );
}
