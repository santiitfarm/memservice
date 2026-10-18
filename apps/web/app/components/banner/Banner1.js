import Image from "next/image";
import Link from "next/link";

async function Banner1() {
  const response = await fetch(`${process.env.API_URL}/api/banner`);
  const data = await response.json();
  const bannerData = (data?.banner ?? []).slice(0, 3);

  if (!bannerData.length) return null;

  return (
    <section className="relative container mx-auto px-3 lg:px-6">
      {bannerData.length > 0 && (
        <div className="w-full h-full grid md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4">
          {bannerData.map((banner, ind) => (
            <Link
              href={`/product/${banner?.productId?._id}`}
              key={ind}
              className={`${
                ind === 0
                  ? " md:col-span-4 lg:col-span-1"
                  : " md:col-span-2 lg:col-span-1"
              } w-full max-h-64 overflow-hidden rounded-lg`}
            >
              <Image
                className="w-full h-full  object-cover transition-all duration-300"
                src={banner?.image}
                width={400}
                height={400}
                alt=""
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default Banner1;
