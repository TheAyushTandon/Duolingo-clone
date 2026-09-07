"use client";

import React, { useState, useRef, useEffect } from "react";

interface ScrollTriggeredVideoProps {
  initialSrc: string;
  loopSrc: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
}

export function ScrollTriggeredVideo({
  initialSrc,
  loopSrc,
  className = "",
  videoClassName = "",
}: ScrollTriggeredVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasInitialEnded, setHasInitialEnded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // IntersectionObserver to detect when this section is scrolled to
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Play / pause active video based on scroll visibility
  useEffect(() => {
    if (!hasInitialEnded) {
      if (video1Ref.current) {
        if (isInView) {
          video1Ref.current.play().catch(() => {});
        } else {
          video1Ref.current.pause();
        }
      }
    } else {
      if (video2Ref.current) {
        if (isInView) {
          video2Ref.current.play().catch(() => {});
        } else {
          video2Ref.current.pause();
        }
      }
    }
  }, [isInView, hasInitialEnded]);

  const handleInitialEnded = () => {
    setHasInitialEnded(true);
    if (video2Ref.current) {
      video2Ref.current.currentTime = 0;
      if (isInView) {
        video2Ref.current.play().catch(() => {});
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-[520px] aspect-square flex items-center justify-center relative overflow-hidden select-none ${className}`}
    >
      {/* Initial Video (plays once when scrolled into view, object-cover clips pillarbox edges) */}
      <video
        ref={video1Ref}
        src={initialSrc}
        muted
        playsInline
        preload="auto"
        onEnded={handleInitialEnded}
        className={`w-full h-full object-cover scale-[1.04] pointer-events-none transition-opacity duration-300 ${videoClassName} ${
          hasInitialEnded ? "opacity-0 pointer-events-none absolute" : "opacity-100 relative z-10"
        }`}
      />

      {/* Loop Video (plays continuously in loop after initial video ends) */}
      <video
        ref={video2Ref}
        src={loopSrc}
        muted
        playsInline
        loop
        preload="auto"
        className={`w-full h-full object-cover scale-[1.04] pointer-events-none absolute inset-0 transition-opacity duration-300 ${videoClassName} ${
          hasInitialEnded ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"
        }`}
      />
    </div>
  );
}
