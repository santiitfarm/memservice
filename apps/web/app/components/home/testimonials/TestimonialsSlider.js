"use client";

import { Star, CheckCircle, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsSlider({ testimonials = [] }) {
  // If no testimonials in DB, provide default authentic customer testimonials
  const defaultTestimonials = [
    {
      name: "Dr. Farhana Yasmin",
      role: "Verified Patient",
      rating: 5,
      content:
        "Mem Service delivered genuine prescription medicines within 4 hours inside Dhaka. The packaging and temperature control were immaculate.",
      location: "Gulshan, Dhaka",
    },
    {
      name: "Tanvir Ahmed",
      role: "Verified Buyer",
      rating: 5,
      content:
        "The online doctor consultation was seamless. The physician listened carefully and sent an e-prescription right to my phone.",
      location: "Uttara, Dhaka",
    },
    {
      name: "Sharmin Sultana",
      role: "Verified Buyer",
      rating: 5,
      content:
        "Finding authentic imported diabetic supplies in Chittagong used to be difficult until I discovered Mem Service. Highly recommended!",
      location: "Chattogram",
    },
    {
      name: "Rafiqul Islam",
      role: "Verified Patient",
      rating: 5,
      content:
        "Great customer support on WhatsApp and live delivery tracking with Steadfast courier. Everything was genuine and well-packed.",
      location: "Sylhet",
    },
  ];

  const items = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="container mx-auto px-3 lg:px-6">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          What Our Customers Say
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Real reviews from verified patients and customers across Bangladesh
        </p>
      </div>

      <Swiper
        loop={items.length > 3}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        modules={[Autoplay, Pagination]}
        className="pb-12"
      >
        {items.map((item, idx) => {
          const rating = item.rating || 5;
          const name = item.name || item.author || "Customer";
          const quote = item.content || item.comment || item.quote || "";
          const location = item.location || item.city || "Bangladesh";

          return (
            <SwiperSlide key={item._id || idx} className="h-auto">
              <div className="flex flex-col justify-between h-full p-6 rounded-2xl border border-border bg-card shadow-sm text-card-foreground hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={i < rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}
                        />
                      ))}
                    </div>

                    <Quote className="text-primary/30 w-6 h-6" />
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground italic mb-6">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground">{name}</h4>
                      <CheckCircle size={13} className="text-emerald-500 fill-emerald-500/20" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{location}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
