import Image from "next/image";
import Link from "next/link";

const ShopBanner = ({ bannerData }) => {
  const banners = bannerData.slice(7, 9);
  console.log(banners);
  return (
    <div className="container mx-auto mt-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-6 items-center">
        {banners.map((banner) => (
          <div
            className="w-full flex justify-center p-4 bg-light-mist  rounded-lg"
            key={banner.id}
          >
            <Link href={`/product/${banner.productId._id}`}>
              <Image
                className="flex items-start "
                src={banner.image}
                width={200}
                height={100}
                alt="Banner 1"
              />
            </Link>
          </div>
        ))}
        {/* <div className="w-full flex justify-center p-4 bg-light-mist  rounded-lg">
          <Image
            className="flex items-start "
            src="https://enovathemes.com/propharm/wp-content/uploads/bn_img_12.png"
            width={200}
            height={100}
            alt="Banner 1"
          />
        </div> */}
      </div>
    </div>
  );
};

export default ShopBanner;
