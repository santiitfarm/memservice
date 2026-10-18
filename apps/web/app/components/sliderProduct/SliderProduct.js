"use client";
// import lucide icons
import { ChevronLeft, ChevronRight } from "lucide-react";
// Import Swiper React components
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import SliderProductCart from "./SliderProductCart";

const customButtonStyles =
  "static xl:absolute w-7 sm:w-9 h-7 sm:h-9 text-base xl:text-xl bg-sky-blue text-white flex items-center justify-center border-none xl:top-1/2 transform -translate-y-1/2 z-10 cursor-pointer rounded-full xl:opacity-0 visibility-hidden group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg";
  
export default function SliderProduct({ brandData = [] }) {
  if (!brandData.length) return null;

  return (
    <main className="relative container mx-auto px-3 lg:px-6 group mb-12 xl:mb-0">
      <h2 className="mb-6 text-2xl font-bold text-deep-sea-blue">
        Shop by Brand
      </h2>
      {/* Custom Navigation Buttons */}
      <div className="absolute xl:static -bottom-16 sm:-bottom-20  flex gap-6 left-1/2 xl:left-auto transform xl:transform-none -translate-x-1/2">
        <div
          className={`${customButtonStyles} custom-productSlider-button-prev xl:left-0 group-hover:opacity-1`}
        >
          <ChevronLeft strokeWidth={1.5} />
        </div>
        <div
          className={`${customButtonStyles} custom-productSlider-button-next  xl:right-0 group-hover:opacity-1`}
        >
          <ChevronRight strokeWidth={1.5} />
        </div>
      </div>
      <Swiper
        loop={brandData.length > 6}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".custom-productSlider-button-next",
          prevEl: ".custom-productSlider-button-prev",
        }}
        breakpoints={{
          0: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          320: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
        }}
        modules={[Navigation, Autoplay]} // Fade effect removed
        className="w-full h-full"
      >
        {brandData.map((data, ind) => (
          <SwiperSlide key={ind}>
            <SliderProductCart cartData={data} />
          </SwiperSlide>
        ))}
      </Swiper>
    </main>
  );
}
