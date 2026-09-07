"use client";

import React, { useState, useRef, useEffect } from "react";

export function HeroAnimationVideo() {
  const [hasFirstEnded, setHasFirstEnded] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video1Ref.current) {
      video1Ref.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  const handleVideo1Ended = () => {
    setHasFirstEnded(true);
    if (video2Ref.current) {
      video2Ref.current.currentTime = 0;
      video2Ref.current.play().catch(() => {});
    }
  };

  return (
    <div className="w-full max-w-[420px] aspect-square flex items-center justify-center select-none relative overflow-hidden">
      {/* Video 1: Initial intro animation (plays once) */}
      <video
        ref={video1Ref}
        src="/assets/landing animation 1.webm"
        autoPlay
        muted
        playsInline
        onEnded={handleVideo1Ended}
        className={`w-full h-full object-cover scale-[1.07] pointer-events-none transition-opacity duration-300 ${
          hasFirstEnded ? "opacity-0 pointer-events-none" : "opacity-100 relative z-10"
        }`}
      />

      {/* Video 2: Ambient loop animation (loops continuously after Video 1) */}
      <video
        ref={video2Ref}
        src="/assets/landing animation 2.webm"
        muted
        playsInline
        loop
        preload="auto"
        className={`w-full h-full object-cover scale-[1.07] pointer-events-none absolute inset-0 transition-opacity duration-300 ${
          hasFirstEnded ? "opacity-100 z-10" : "opacity-0 -z-10"
        }`}
      />
    </div>
  );
}
