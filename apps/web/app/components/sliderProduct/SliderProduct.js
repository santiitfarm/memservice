"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import SliderProductCart from "./SliderProductCart";

const DEFAULT_BRANDS = [
  {
    _id: "def-b1",
    title: "ACI Consumer Brands",
    slug: "aci-consumer-brands",
    logo: "/assets/brands/aci.svg",
  },
  {
    _id: "def-b2",
    title: "Square Toiletries Ltd.",
    slug: "square-toiletries-ltd",
    logo: "/assets/brands/square.svg",
  },
  {
    _id: "def-b3",
    title: "SMC Enterprise Limited",
    slug: "smc-enterprise-limited",
    logo: "/assets/brands/ziska.svg",
  },
  {
    _id: "def-b4",
    title: "Ibn Sina",
    slug: "ibn-sina",
    logo: "/assets/brands/ibnsina.svg",
  },
  {
    _id: "def-b5",
    title: "Mundipharma (BD) Pvt. Ltd.",
    slug: "mundipharma-bd-pvt-ltd",
    logo: "/assets/brands/biopharma.svg",
  },
  {
    _id: "def-b6",
    title: "Incepta Pharmaceuticals Ltd.",
    slug: "incepta-pharmaceuticals-ltd",
    logo: "/assets/brands/incepta.svg",
  },
  {
    _id: "def-b7",
    title: "Beximco Pharmaceuticals Ltd.",
    slug: "beximco-pharmaceuticals-ltd",
    logo: "/assets/brands/beximco.svg",
  },
  {
    _id: "def-b8",
    title: "Renata Limited",
    slug: "renata-limited",
    logo: "/assets/brands/renata.svg",
  },
];

export default function SliderProduct({ brandData = [] }) {
  const brands = Array.isArray(brandData) && brandData.length > 0 ? brandData : DEFAULT_BRANDS;

  return (
    <section className="relative container mx-auto px-3 lg:px-6 group">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Shop by Brand
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Top genuine healthcare and pharmaceutical manufacturers
          </p>
        </div>

        {/* Custom Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous brand slide"
            className="brand-swiper-prev w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Next brand slide"
            className="brand-swiper-next w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-40"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="relative border-y border-border/50 py-4 sm:py-6">
        <Swiper
          loop={brands.length > 5}
          speed={600}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: ".brand-swiper-next",
            prevEl: ".brand-swiper-prev",
          }}
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 16 },
            480: { slidesPerView: 3, spaceBetween: 18 },
            640: { slidesPerView: 4, spaceBetween: 20 },
            768: { slidesPerView: 5, spaceBetween: 24 },
            1024: { slidesPerView: 6, spaceBetween: 28 },
          }}
          modules={[Navigation, Autoplay]}
          className="w-full select-none"
        >
          {brands.map((data, ind) => (
            <SwiperSlide key={data?._id || ind}>
              <SliderProductCart cartData={data} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
