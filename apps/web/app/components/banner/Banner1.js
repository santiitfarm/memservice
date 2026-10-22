import Image from "next/image";
import Link from "next/link";

export default function Banner1({ banners = [] }) {
  // Use banners marked as home-grid-1 or first 3
  const bannerGrid = banners.filter((b) => b.group === "home-grid-1");
  const items = bannerGrid.length > 0 ? bannerGrid : banners.slice(0, 3);

  if (!items || items.length === 0) return null;

  return (
    <section className="container mx-auto px-3 lg:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((banner, ind) => {
          const prod = banner?.productId;
          const targetUrl = prod
            ? `/product/${prod.slug || prod._id || prod.id || prod}`
            : banner?.link || "/shop";

          return (
            <Link
              key={banner?._id || ind}
              href={targetUrl}
              className="relative w-full aspect-[21/9] sm:aspect-[16/7] lg:aspect-[16/8] overflow-hidden rounded-2xl border border-border shadow-sm group bg-muted/20"
            >
              <Image
                src={banner?.image || "/assets/banner/01.jpg"}
                alt={banner?.title || `Banner ${ind + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
