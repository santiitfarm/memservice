"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

const HorizontalGallery = ({ images, handleThumbnailClick }) => {
    const galleryRef = useRef(null);
    const length = images.length;
    // console.log(images[0]);

    // Scroll horizontally on mouse wheel
    const handleWheel = (event) => {
        if (galleryRef.current) {
            galleryRef.current.scrollLeft += event.deltaY;
        }
    };

    // Scroll by buttons
    const scrollGallery = (direction) => {
        if (galleryRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            galleryRef.current.scrollLeft += scrollAmount;
        }
    };


    return (
        <div className="relative flex items-center">
            {/* Previous Button */}
            {images.length > 5 && (<button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-sky-blue text-white p-2 shadow-md rounded-full opacity-0 hover:opacity-100"
                onClick={() => scrollGallery('left')}
            >
                <ChevronLeft strokeWidth={1.5} size={18} />
            </button>)}

            {/* Gallery Container */}
            <div
                className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth w-full px-2 custom-scrollbar"
                onWheel={handleWheel}
                ref={galleryRef}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-20 h-20 rounded overflow-hidden cursor-pointer"
                        onClick={() => handleThumbnailClick(index)}
                    >
                        <Image
                            src={image}
                            alt={`Gallery Image ${index + 1}`}
                            className="object-cover w-full h-full"
                            width={100}
                            height={100}
                        />
                    </div>
                ))}
            </div>

            {/* Next Button */}
            {images.length > 5 && (<button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-sky-blue text-white p-2 rounded-full shadow-md opacity-0 hover:opacity-100"
                onClick={() => scrollGallery('right')}
            >
                <ChevronRight strokeWidth={1.5} size={18} />
            </button>)}
        </div>
    );
};

export default HorizontalGallery;
