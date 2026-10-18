import Image from "next/image";
import Link from "next/link";
async function Banner2() {
  const response = await fetch(`${process.env.API_URL}/api/banner`);
  const data = await response.json();
  const bannerData = (data?.banner ?? []).slice(3, 5);

  if (!bannerData.length) return null;

  return (
    <section className="relative container mx-auto px-3 lg:px-6">
      {bannerData.length > 0 && (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {bannerData.map((banner, ind) => (
            <Link
              href={`/product/${banner?.productId?._id}`}
              key={ind}
              className={`${
                ind === 0 ? "xl:col-span-2" : ""
              } w-full max-h-96 overflow-hidden rounded-lg`}
            >
              <Image
                className="w-full h-full object-cover transition-all duration-300"
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

export default Banner2;
