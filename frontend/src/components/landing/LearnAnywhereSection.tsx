"use client";

import React, { useRef } from "react";
import { useScroll } from "framer-motion";
import DuolingoLearnAnywhereAnimation from "./DuolingoLearnAnywhereAnimation";

export default function LearnAnywhereSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate on natural scroll while scrolling down (no sticky pinning)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "center 5%"],
  });

  const [animProgress, setAnimProgress] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setAnimProgress(Math.max(0, Math.min(1, latest)));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className="relative w-full overflow-x-clip max-w-[100vw]">
      {/* 
        Silky Smooth Gradient Bridge (White to Duolingo Sky Blue #E0F5FF)
        Provides a seamless, compact vertical gradient from Feature 4 to Sky Blue.
      */}
      <div
        className="w-full h-20 sm:h-28 bg-gradient-to-b from-white via-[#EDF8FD] to-[#E0F5FF] pointer-events-none relative z-10"
        aria-hidden="true"
      />

      {/* Natural Scrolling Interactive Section on Duolingo Sky Blue (#E0F5FF) */}
      <section
        ref={containerRef}
        className="relative w-full bg-[#E0F5FF] select-none pt-14 sm:pt-18 lg:pt-22 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-8 overflow-hidden flex flex-col items-center"
      >
        {/* Top Header & Store Download Badges */}
        <div className="z-20 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          {/* Headline in Duolingo Feather Bold & Deep Navy #042C60 */}
          <h2
            className="font-feather text-4xl sm:text-6xl lg:text-[64px] font-black lowercase leading-[1.08] tracking-tight !text-[#042C60]"
            style={{ color: "#042C60" }}
          >
            <span style={{ color: "#042C60" }}>
              learn anytime,
            </span>
            <br />
            <span style={{ color: "#042C60" }}>
              anywhere
            </span>
          </h2>

          {/* Side-by-Side Store Badges: Apple App Store (left) & Google Play (right) */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {/* Apple App Store Button */}
            <a
              className="bg-white border-2 border-[#E5E5E5] hover:border-[#1CB0F6] active:translate-y-0.5 shadow-[0_2px_0_#E5E5E5] transition-all rounded-2xl px-5 py-2.5 flex items-center gap-3 cursor-pointer group"
              href="//itunes.apple.com/app/duolingo-learn-spanish-french/id570060128?mt=8"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4B4B4B" }}
            >
              <span className="flex items-center justify-center shrink-0">
                <svg viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform">
                  <title>badge-app-store</title>
                  <path
                    d="M26.9039 19.1188C26.9363 16.611 28.2528 14.2945 30.3922 12.981C29.0364 11.0473 26.8469 9.86522 24.4843 9.7914C21.9986 9.53084 19.5888 11.2768 18.3221 11.2768C17.0309 11.2768 15.0807 9.81727 12.9806 9.86042C10.2174 9.94957 7.7038 11.4804 6.35946 13.8929C3.49663 18.8428 5.63205 26.1174 8.3744 30.1184C9.74645 32.0776 11.35 34.2661 13.4482 34.1885C15.5014 34.1035 16.2682 32.881 18.7466 32.881C21.202 32.881 21.9215 34.1885 24.0623 34.1392C26.2655 34.1035 27.6536 32.1713 28.9775 30.1935C29.9633 28.7975 30.7219 27.2546 31.2252 25.622C28.6084 24.5167 26.907 21.9562 26.9039 19.1188V19.1188Z"
                    fill="#4B4B4B"
                  />
                  <path
                    d="M22.8604 7.16005C24.0617 5.71991 24.6535 3.86887 24.5102 2C22.6749 2.1925 20.9796 3.06846 19.7621 4.45334C18.5599 5.81971 17.9508 7.60728 18.0691 9.42235C19.929 9.44147 21.6949 8.60765 22.8604 7.16005V7.16005Z"
                    fill="#4B4B4B"
                  />
                </svg>
              </span>
              <span className="flex flex-col items-start leading-tight text-left">
                <span className="text-[10.5px] font-bold tracking-tight block leading-none !text-[#4B4B4B]" style={{ color: "#4B4B4B" }}>
                  Download on the
                </span>
                <span className="text-[15px] font-black tracking-tight block leading-none mt-1 !text-[#4B4B4B]" style={{ color: "#4B4B4B" }}>
                  App Store
                </span>
              </span>
            </a>

            {/* Google Play Button */}
            <a
              className="bg-white border-2 border-[#E5E5E5] hover:border-[#1CB0F6] active:translate-y-0.5 shadow-[0_2px_0_#E5E5E5] transition-all rounded-2xl px-5 py-2.5 flex items-center gap-3 cursor-pointer group"
              href="//play.google.com/store/apps/details?hl=en&amp;id=com.duolingo&amp;referrer=utm_source%3Dduolingo.com%26utm_medium%3Dduolingo_web%26utm_content%3Ddownload_button%26utm_campaign%3Dsplash"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4B4B4B" }}
            >
              <span className="flex items-center justify-center shrink-0">
                <svg viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform">
                  <title>badge-app-store</title>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.80942 4.3203C3.80942 4.09554 3.82731 3.88521 3.86151 3.69016L17.8617 18.4703L3.83906 33.2741C3.81952 33.1218 3.80942 32.961 3.80942 32.792V4.3203ZM5.35237 35.0876C5.86758 35.1708 6.47838 35.0454 7.13188 34.6805L24.1811 25.1417L19.4773 20.1758L5.35237 35.0876ZM21.0928 18.4703L26.2937 23.9609L32.63 20.4164C34.4567 19.393 34.4567 17.7194 32.63 16.6985L26.1861 13.0933L21.0928 18.4703ZM24.0742 11.9117L7.13188 2.43299C6.60625 2.13818 6.10808 1.99915 5.66613 1.99915C5.60892 1.99915 5.55264 2.00146 5.49734 2.00606L19.4773 16.7648L24.0742 11.9117Z"
                    fill="#4B4B4B"
                  />
                </svg>
              </span>
              <span className="flex flex-col items-start leading-tight text-left">
                <span className="text-[10.5px] font-bold tracking-tight block leading-none !text-[#4B4B4B]" style={{ color: "#4B4B4B" }}>
                  Get it on
                </span>
                <span className="text-[15px] font-black tracking-tight block leading-none mt-1 !text-[#4B4B4B]" style={{ color: "#4B4B4B" }}>
                  Google Play
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Central Isometric Floating Illustration */}
        <div className="w-full flex items-center justify-center relative mt-6 sm:mt-10 scale-[1.12] sm:scale-[1.2] lg:scale-[1.28] xl:scale-[1.34] origin-center pointer-events-none">
          <DuolingoLearnAnywhereAnimation progress={animProgress} />
        </div>
      </section>
    </div>
  );
}
