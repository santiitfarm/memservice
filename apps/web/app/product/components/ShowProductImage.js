"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShowProductImage({ data = [], activeImageOverride }) {
  const images = useMemo(
    () => (Array.isArray(data) && data.length > 0 ? data : ["/assets/banner/01.jpg"]),
    [data]
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Sync when variant changes selected image
  useEffect(() => {
    if (activeImageOverride) {
      const idx = images.indexOf(activeImageOverride);
      if (idx !== -1) setActiveSlide(idx);
    }
  }, [activeImageOverride, images]);

  // Desktop hover zoom effect
  const handleMouseMove = (e) => {
    if (!containerRef.current || !imageRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));

    setZoomStyle({
      backgroundImage: `url(${images[activeSlide]})`,
      backgroundSize: "220%",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  const nextImage = () => {
    setActiveSlide((prev) => (prev + 1) % images.length);
    setZoomStyle({});
  };

  const prevImage = () => {
    setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
    setZoomStyle({});
  };

  return (
    <div className="relative flex flex-col gap-3">
      {/* Main Image with Zoom Effect */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-square max-h-[460px] rounded-2xl overflow-hidden border border-border bg-card p-4 flex items-center justify-center group shadow-sm"
      >
        <Image
          ref={imageRef}
          src={images[activeSlide] || "/assets/banner/01.jpg"}
          alt={`Product photo ${activeSlide + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-contain p-4 select-none"
        />

        {/* Zoom Overlay (visible on desktop hover) */}
        <div
          style={zoomStyle}
          className="absolute inset-0 pointer-events-none cursor-crosshair transition-opacity duration-150"
        />

        {/* Carousel arrows (if >1 image) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 hover:bg-card text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/80 hover:bg-card text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveSlide(idx);
                setZoomStyle({});
              }}
              aria-label={`Thumbnail ${idx + 1}`}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                activeSlide === idx
                  ? "border-primary shadow-sm scale-105"
                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
