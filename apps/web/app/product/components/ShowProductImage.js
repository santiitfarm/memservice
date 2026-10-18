"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import HorizontalGallery from "./HorizontalGallery";

export default function ShowProductImage({ data }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Handle mouse move to zoom on image
  const handleMouseMove = (e) => {
    if (!containerRef.current || !imageRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    const imageWidth = imageRef.current.naturalWidth;
    const imageHeight = imageRef.current.naturalHeight;
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    // Calculate zoom based on the image size
    const zoomLevelX = Math.max(imageWidth / containerWidth, 2);
    const zoomLevelY = Math.max(imageHeight / containerHeight, 2);

    setZoomStyle({
      backgroundImage: `url(${data[activeSlide]})`,
      backgroundSize: `${zoomLevelX * 100}% ${zoomLevelY * 100}%`, // Adjust zoom level here
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  // Handle mouse leave to reset zoom effect
  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  const handleThumbnailClick = (index) => {
    setActiveSlide(index);
    setZoomStyle({});
  };

  return (
    <main className="relative">
      {/* Main Image with Zoom Effect */}
      <div
        ref={containerRef}
        className="w-full h-[450px] max-h-[450px] rounded-lg overflow-hidden mb-4 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          ref={imageRef}
          src={data[activeSlide]}
          className="object-cover w-full h-full"
          width={600}
          height={450}
          alt={`Image ${activeSlide + 1}`}
        />
        <div
          style={zoomStyle}
          className="absolute top-0 left-0 w-full h-full cursor-zoom-in"
        />
      </div>
      <div>
        <HorizontalGallery images={data} handleThumbnailClick={handleThumbnailClick}/>
      </div>
    </main>
  );
}
