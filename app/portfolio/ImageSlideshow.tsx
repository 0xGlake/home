"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ImageSlideshowProps {
  images: string[];
  alt: string;
  intervalMs?: number;
}

const ImageSlideshow = ({
  images,
  alt,
  intervalMs = 4000,
}: ImageSlideshowProps) => {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + images.length) % images.length);
    },
    [images.length]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [hasMultiple, images.length, intervalMs]);

  // Buttons live inside a parent <Link>, so stop the click from navigating.
  const handleNav = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded overflow-hidden relative">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => handleNav(e, goPrev)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => handleNav(e, goNext)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            &#8250;
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => handleNav(e, () => goTo(i))}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlideshow;
