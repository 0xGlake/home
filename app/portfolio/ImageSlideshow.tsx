"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasMultiple = images.length > 1;

  useEffect(() => setMounted(true), []);

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + images.length) % images.length);
    },
    [images.length]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const close = useCallback(() => {
    setIsExpanded(false);
    setIsZoomed(false);
  }, []);

  useEffect(() => {
    // Pause auto-advance while the lightbox is open.
    if (!hasMultiple || isExpanded) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [hasMultiple, images.length, intervalMs, isExpanded]);

  // Reset zoom whenever the visible image changes.
  useEffect(() => setIsZoomed(false), [index]);

  // Keyboard controls + scroll lock for the lightbox.
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isExpanded, goNext, goPrev, close]);

  // Buttons live inside a parent <Link>, so stop the click from navigating.
  const handleNav = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="group/slideshow w-full h-full flex items-center justify-center bg-black rounded overflow-hidden relative">
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

      {/* Expand to lightbox */}
      <button
        type="button"
        aria-label="Expand image"
        onClick={(e) => handleNav(e, () => setIsExpanded(true))}
        className="absolute right-2 top-2 z-30 flex h-8 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm font-medium text-white opacity-0 group-hover/slideshow:opacity-100 hover:bg-black/70 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </svg>
        Expand
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => handleNav(e, goPrev)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => handleNav(e, goNext)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            &#8250;
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
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

      {/* Lightbox — rendered in a portal so it covers the viewport and
          isn't clipped by the card's overflow-hidden / stacking context. */}
      {mounted &&
        isExpanded &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} expanded`}
            onClick={(e) => handleNav(e, close)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={(e) => handleNav(e, close)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 transition-colors"
            >
              &times;
            </button>

            <div
              onClick={(e) => handleNav(e, () => setIsZoomed((z) => !z))}
              className={`relative h-full w-full max-w-6xl ${
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
            >
              <Image
                src={images[index]}
                alt={alt}
                fill
                sizes="100vw"
                className={`object-contain transition-transform duration-300 ${
                  isZoomed ? "scale-[1.8]" : "scale-100"
                }`}
              />
            </div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => handleNav(e, goPrev)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 transition-colors"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => handleNav(e, goNext)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 transition-colors"
                >
                  &#8250;
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={(e) => handleNav(e, () => goTo(i))}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        i === index
                          ? "bg-white"
                          : "bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ImageSlideshow;
