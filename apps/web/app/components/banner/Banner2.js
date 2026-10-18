import Image from "next/image";
import Link from "next/link";

async function Banner2() {
  let bannerData = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/banner`);
    if (response.ok) {
      const data = await response.json();
      bannerData = (data?.banner ?? []).slice(3, 5);
    }
  } catch (err) {
    console.error("Failed to fetch banners:", err);
  }

  if (!bannerData.length) return null;

  return (
    <section className="relative container mx-auto px-3 lg:px-6">
      {bannerData.length > 0 && (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {bannerData.map((banner, ind) => {
            const prodId = banner?.productId?._id || banner?.productId || "";
            return (
              <Link
                href={prodId ? `/product/${prodId}` : "/shop"}
                key={banner?._id || ind}
                className={`${
                  ind === 0 ? "xl:col-span-2" : ""
                } w-full max-h-96 overflow-hidden rounded-lg`}
              >
                <Image
                  className="w-full h-full object-cover transition-all duration-300"
                  src={banner?.image || "/assets/banner/banner2.jpg"}
                  width={400}
                  height={400}
                  alt={banner?.title || "Banner"}
                />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Banner2;
