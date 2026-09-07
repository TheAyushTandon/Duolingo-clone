"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnimationItem } from "lottie-web";
import { useSound } from "@/hooks/useSound";

export default function SuperDuolingoSection() {
  const { playClick } = useSound();
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<AnimationItem | null>(null);
  const [isLottieLoaded, setIsLottieLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    import("lottie-web").then((lottieModule) => {
      const lottie = lottieModule.default;
      if (!isMounted || !lottieContainerRef.current) return;

      try {
        animInstanceRef.current = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/assets/904f242fe2ab5477e3b97928d3e1cb89.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
        });

        // Loop the specific cosmic idle segment as in Duolingo's live application
        animInstanceRef.current.addEventListener("DOMLoaded", () => {
          if (!isMounted) return;
          setIsLottieLoaded(true);
          try {
            animInstanceRef.current?.playSegments([35, 156], true);
          } catch (e) {
            console.error("Lottie segment error:", e);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Super Duolingo Lottie animation:", err);
      }
    });

    return () => {
      isMounted = false;
      if (animInstanceRef.current) {
        animInstanceRef.current.destroy();
        animInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center bg-[#100F3E] text-white py-16 sm:py-20 lg:py-24 px-6 overflow-hidden select-none"
      aria-label="Super Duolingo promotion"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 my-auto">
        
        {/* Left: Glowing Super Duolingo Space Mascot */}
        <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] flex items-center justify-center shrink-0">
          {/* Static SVG Fallback / Instant placeholder */}
          <img
            src="/assets/22fce01f6df43e0472d7585afad9a43a.svg"
            alt="Super Duolingo Mascot"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 pointer-events-none ${
              isLottieLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Lottie Interactive Animation Container */}
          <div
            ref={lottieContainerRef}
            className={`w-full h-full transition-opacity duration-500 ${
              isLottieLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Right: Typography & 3D Action Button */}
        <div className="flex flex-col items-center text-center space-y-7 max-w-xl">
          {/* Official "POWER UP WITH SUPER DUOLINGO" Vector Picture */}
          <picture className="w-full flex justify-center">
            <source
              media="(min-width: 768px)"
              srcSet="/assets/3a733db6d6873e1a915f70cf72554ce3.svg"
              width={605}
              height={91}
            />
            <img
              src="/assets/dd7453522d3192d4df06d4652508b8bc.svg"
              alt="Power up with Super Duolingo"
              width={339}
              height={55}
              className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[540px] lg:max-w-[605px] h-auto object-contain select-none"
            />
          </picture>

          {/* 3D Tactile White Button with Deep Navy #042C60 text */}
          <div className="w-full flex justify-center pt-2">
            <Link
              href="/learn"
              onClick={playClick}
              className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-[#042C60] font-black uppercase text-[15px] tracking-[0.8px] px-8 py-3.5 sm:py-4 rounded-2xl shadow-[0_4px_0_#757299] hover:shadow-[0_4px_0_#656289] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer select-none"
              style={{ color: "#042C60" }}
            >
              TRY 1 WEEK FREE
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
