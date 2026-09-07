"use client";

import React, { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

interface DuolingoLearnAnywhereAnimationProps {
  progress?: number; // 0 to 1
}

export default function DuolingoLearnAnywhereAnimation({
  progress = 0,
}: DuolingoLearnAnywhereAnimationProps) {
  const idleContainerRef = useRef<HTMLDivElement>(null);
  const charContainerRef = useRef<HTMLDivElement>(null);

  const idleAnimRef = useRef<AnimationItem | null>(null);
  const charAnimRef = useRef<AnimationItem | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load lottie-web only on client
    import("lottie-web").then((lottieModule) => {
      const lottie = lottieModule.default;
      if (!isMounted) return;

      // 1. Load Background Idle Loop Animation (Floating elements: crown, gems, heart, tiles)
      if (idleContainerRef.current && !idleAnimRef.current) {
        idleAnimRef.current = lottie.loadAnimation({
          container: idleContainerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "/assets/c02b5f75d9ec48815e6a964f641a9fe2.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
        });
      }

      // 2. Load Foreground Character Scroll Animation (Bear diving, Cat leaping, Duo flying)
      if (charContainerRef.current && !charAnimRef.current) {
        charAnimRef.current = lottie.loadAnimation({
          container: charContainerRef.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          path: "/assets/c16e90b93e35750c893be4b58720cef2.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
          },
        });

        charAnimRef.current.addEventListener("DOMLoaded", () => {
          if (!isMounted) return;
          setIsLoaded(true);
          // Set initial frame (frame 0)
          charAnimRef.current?.goToAndStop(0, true);
        });
      }
    });

    return () => {
      isMounted = false;
      idleAnimRef.current?.destroy();
      charAnimRef.current?.destroy();
      idleAnimRef.current = null;
      charAnimRef.current = null;
    };
  }, []);

  // Update character animation frame smoothly when scroll progress changes
  useEffect(() => {
    if (charAnimRef.current && isLoaded) {
      // Duolingo's character animation has 450 frames
      const targetFrame = Math.min(Math.max(progress * 450, 0), 450);
      charAnimRef.current.goToAndStop(targetFrame, true);
    }
  }, [progress, isLoaded]);

  return (
    <div className="relative w-full max-w-[1800px] aspect-[4100/2300] mx-auto select-none pointer-events-none flex items-center justify-center">
      {/* SVG Base Placeholder (visible before Lottie loads) */}
      <img
        src="/assets/splash-phones.svg"
        alt="Duolingo learn anytime, anywhere"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
        style={{ opacity: isLoaded ? 0 : 1 }}
      />

      {/* Layer 1: Idle Floating Elements Loop (crown, flame, heart, gems, tiles) */}
      <div
        ref={idleContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Layer 2: Foreground Characters Scrubbed by Scroll (Bear diving, Grandma reaching, Cat jumping, Duo flying) */}
      <div
        ref={charContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
