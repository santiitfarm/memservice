"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import SliderProductCart from "./SliderProductCart";

const customButtonStyles =
  "static xl:absolute w-8 sm:w-10 h-8 sm:h-10 text-base xl:text-xl bg-primary text-primary-foreground flex items-center justify-center border-none xl:top-1/2 transform -translate-y-1/2 z-10 cursor-pointer rounded-full xl:opacity-0 visibility-hidden group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-md";

export default function SliderProduct({ brandData = [] }) {
  if (!brandData.length) return null;

  return (
    <section className="relative container mx-auto px-3 lg:px-6 group mb-10 xl:mb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Shop by Brand
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Top genuine healthcare and pharmaceutical manufacturers
          </p>
        </div>

        {/* Custom Navigation Buttons */}
        <div className="flex gap-2">
          <div className={`${customButtonStyles} custom-productSlider-button-prev xl:left-0`}>
            <ChevronLeft size={18} strokeWidth={2} />
          </div>
          <div className={`${customButtonStyles} custom-productSlider-button-next xl:right-0`}>
            <ChevronRight size={18} strokeWidth={2} />
          </div>
        </div>
      </div>

      <Swiper
        loop={brandData.length > 6}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation={{
          nextEl: ".custom-productSlider-button-next",
          prevEl: ".custom-productSlider-button-prev",
        }}
        breakpoints={{
          0: { slidesPerView: 2, spaceBetween: 12 },
          480: { slidesPerView: 3, spaceBetween: 14 },
          640: { slidesPerView: 4, spaceBetween: 16 },
          768: { slidesPerView: 5, spaceBetween: 20 },
          1024: { slidesPerView: 6, spaceBetween: 24 },
        }}
        modules={[Navigation, Autoplay]}
        className="w-full h-full"
      >
        {brandData.map((data, ind) => (
          <SwiperSlide key={data?._id || ind}>
            <SliderProductCart cartData={data} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
