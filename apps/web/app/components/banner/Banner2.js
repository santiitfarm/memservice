import Image from "next/image";
import Link from "next/link";

export default function Banner2({ banners = [] }) {
  // Use banners marked as home-grid-2 or slice 3..5
  const bannerGrid = banners.filter((b) => b.group === "home-grid-2");
  const items = bannerGrid.length > 0 ? bannerGrid : banners.slice(3, 5);

  if (!items || items.length === 0) return null;

  return (
    <section className="container mx-auto px-3 lg:px-6">
      <div className={`grid grid-cols-1 ${items.length > 1 ? "md:grid-cols-2" : "grid-cols-1"} gap-4`}>
        {items.map((banner, ind) => {
          const prod = banner?.productId;
          const targetUrl = prod
            ? `/product/${prod.slug || prod._id || prod.id || prod}`
            : banner?.link || "/shop";

          return (
            <Link
              key={banner?._id || ind}
              href={targetUrl}
              className="relative w-full aspect-[21/9] sm:aspect-[16/7] overflow-hidden rounded-2xl border border-border shadow-sm group bg-muted/20"
            >
              <Image
                src={banner?.image || "/assets/banner/01.jpg"}
                alt={banner?.title || `Banner ${ind + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
