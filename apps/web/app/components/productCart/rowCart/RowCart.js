import Image from "next/image";
import Link from "next/link";

export default function RowCart({ productData }) {
  if (!productData) return null;

  const id = productData.id || productData._id;
  const slug = productData.slug || id;
  const name = productData.title || productData.name || "Product";
  const manufacturer = productData.manufacturer_name || productData.manufacturer || "";
  const regularPrice = Number(productData.oldPrice || productData.regular_price || 0);
  const discountPrice = Number(productData.discount || productData.discount_price || 0);
  const effectivePrice = discountPrice > 0 ? discountPrice : regularPrice;

  return (
    <div className="relative group flex items-center gap-3 p-2 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/40">
      <Link
        href={`/product/${slug}`}
        className="overflow-hidden bg-muted/40 rounded-lg w-20 h-20 shrink-0 relative flex items-center justify-center p-1"
      >
        <Image
          className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
          src={productData?.image || "/assets/banner/01.jpg"}
          width={120}
          height={120}
          alt={name}
        />
      </Link>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {manufacturer && (
          <p className="text-[10px] text-muted-foreground uppercase font-medium truncate">
            <Link href={`/shop?brand=${encodeURIComponent(manufacturer)}`} className="hover:text-primary transition-colors">
              {manufacturer}
            </Link>
          </p>
        )}

        <Link
          className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight"
          href={`/product/${slug}`}
        >
          {name}
        </Link>

        <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 mt-0.5">
          <span>৳{effectivePrice.toLocaleString("en-BD")}</span>
          {discountPrice > 0 && discountPrice < regularPrice && (
            <del className="text-[11px] text-muted-foreground font-normal">
              ৳{regularPrice.toLocaleString("en-BD")}
            </del>
          )}
        </p>
      </div>
    </div>
  );
}
