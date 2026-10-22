"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// Swiper CSS
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider({ sliderData = [] }) {
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Fallback banner if no slides in DB
  if (!sliderData || sliderData.length === 0) {
    return (
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] xl:aspect-[2.4/1] min-h-[200px] sm:min-h-[300px] xl:min-h-[460px] rounded-xl overflow-hidden bg-gradient-to-r from-sky-500 to-primary">
        <Link href="/shop" className="block w-full h-full relative">
          <Image
            src="/assets/banner/01.jpg"
            alt="Healthcare Banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 900px"
            className="object-cover"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] xl:aspect-[2.4/1] min-h-[200px] sm:min-h-[300px] xl:min-h-[460px] rounded-xl overflow-hidden group shadow-sm bg-muted/20">
      {/* Custom Prev/Next Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        className="hero-swiper-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-md"
      >
        <IoIosArrowBack className="text-xl sm:text-2xl" />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        className="hero-swiper-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-md"
      >
        <IoIosArrowForward className="text-xl sm:text-2xl" />
      </button>

      <Swiper
        onSwiper={setSwiperInstance}
        loop={sliderData.length > 1}
        speed={700}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation={{
          nextEl: ".hero-swiper-next",
          prevEl: ".hero-swiper-prev",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        className="w-full h-full"
      >
        {sliderData.map((slide, index) => {
          // Determine target URL for image slide
          let targetUrl = "/shop";
          if (slide?.productId) {
            const product = slide.productId;
            const slugOrId = product.slug || product._id || product.id || product;
            targetUrl = `/product/${slugOrId}`;
          } else if (slide?.link) {
            targetUrl = slide.link;
          }

          const imgSrc = slide?.image || slide?.img || "/assets/banner/01.jpg";

          return (
            <SwiperSlide key={slide?._id || index} className="w-full h-full relative">
              <Link href={targetUrl} className="block w-full h-full relative cursor-pointer">
                {/* Pure Image Only — Zero text overlays or buttons */}
                <Image
                  src={imgSrc}
                  alt={slide?.title || `Banner ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 960px"
                  className="object-cover select-none"
                />
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
