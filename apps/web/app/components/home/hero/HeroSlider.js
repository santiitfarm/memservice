"use client";
import Image from "next/image";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Icons
import Link from "next/link";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const customButtonStyles =
  "absolute w-[50px] h-[50px] border-none top-1/2 transform -translate-y-1/2 z-10 cursor-pointer bg-sky-blue text-white p-3 rounded-full opacity-0 visibility-hidden group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-[0px_20px_30px_-10px_rgba(38,57,77)] text-2xl";

function HeroFallback() {
  return (
    <section className="relative flex h-full min-h-[260px] w-full items-center overflow-hidden rounded-lg bg-gradient-to-br from-sky-blue via-sky-blue to-deep-sea-blue p-8 text-white md:min-h-[360px] lg:min-h-[475px] lg:p-14">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="relative max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
          Mem Service
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          Quality healthcare, delivered to your door
        </h1>
        <p className="mt-4 text-sm leading-6 text-white/90 md:text-base">
          Genuine medicines and health products, plus doctor consultations,
          across Bangladesh.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-sunset-orange px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-deep-sea-blue"
          >
            Shop Now
          </Link>
          <Link
            href="/consultation"
            className="rounded-full border border-white/70 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-deep-sea-blue"
          >
            Book a Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroSlider({ sliderData }) {
  if (!sliderData?.length) return <HeroFallback />;

  return (
    <section className="relative w-full h-full rounded-lg overflow-hidden group">
      {/* Custom Navigation Buttons */}
      <div
        className={`${customButtonStyles} custom-heroSlider-button-prev -left-6 group-hover:left-0 rounded-l-lg`}
      >
        <IoIosArrowBack />
      </div>
      <div
        className={`${customButtonStyles} custom-heroSlider-button-next -right-6 group-hover:right-0 rounded-r-lg`}
      >
        <IoIosArrowForward />
      </div>
      <Swiper
        loop={true}
        spaceBetween={30}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect={"fade"}
        navigation={{
          nextEl: ".custom-heroSlider-button-next",
          prevEl: ".custom-heroSlider-button-prev",
        }}
        pagination={{
          dynamicBullets: true,
        }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        className="w-full h-full"
      >
        {sliderData.map((slider, ind) => (
          <SwiperSlide key={ind}>
            <Link href={`/product/${slider?.productId?._id}`}>
              <Image
                className="w-full max-h-64 md:max-h-72 lg:max-h-[475px] object-cover"
                src={slider?.image}
                width={1600}
                height={600}
                alt=""
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default HeroSlider;
