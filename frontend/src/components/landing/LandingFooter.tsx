"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import FooterDuoMascot from "./FooterDuoMascot";

export default function LandingFooter() {
  const { playClick } = useSound();
  const bannerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(bannerRef, { amount: 0.2, once: false });
  const [isHovered, setIsHovered] = useState(false);

  const sections = [
    {
      title: "About us",
      links: ["Courses", "Mission", "Approach", "Efficacy", "Careers", "Brand Guidelines"],
    },
    {
      title: "Products",
      links: ["Duolingo", "Duolingo for Schools", "Duolingo English Test", "Duolingo ABC", "Duolingo Math"],
    },
    {
      title: "Apps",
      links: ["Duolingo for Android", "Duolingo for iOS"],
    },
    {
      title: "Help & Support",
      links: ["Duolingo FAQs", "Schools FAQs", "Community Guidelines", "Security"],
    },
    {
      title: "Terms & Privacy",
      links: ["Community Guidelines", "Terms of Service", "Privacy Policy", "Respecting Your Privacy"],
    },
  ];

  return (
    <footer className="w-full bg-white flex flex-col select-none relative overflow-hidden" ref={bannerRef}>
      {/* Top Banner Section: Heading & Interactive "GET STARTED" CTA */}
      <div className="w-full pt-16 sm:pt-24 px-6 flex flex-col items-center text-center z-30">
        {/* Duolingo Feather Headline in Official Lime Green */}
        <h2 className="font-feather text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] tracking-tight mb-7 sm:mb-8">
          learn a language<br />with duolingo
        </h2>

        {/* 3D Tactile Green Action Button with hover wing flap trigger */}
        <div>
          <Link
            href="/learn"
            onClick={playClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center justify-center py-3.5 sm:py-4 px-8 sm:px-12 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-wider text-center shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer select-none"
          >
            GET STARTED
          </Link>
        </div>
      </div>

      {/* Interactive Landscape Illustration: Phone + Floating Rewards + Popping/Flapping Duo */}
      <div className="relative w-full overflow-hidden mt-4 sm:mt-6">
        <div className="relative w-full max-w-[1920px] mx-auto aspect-[1920/1060]">
          {/* Base Landscape SVG (Rolling green hills, smartphone, floating coins, gems, chest, flame) */}
          <img
            src="/assets/footer.svg"
            alt="Duolingo interactive learning landscape with phone, gems, and coins"
            width={1920}
            height={1060}
            className="w-full h-full object-cover select-none pointer-events-none"
          />

          {/* Interactive Duo Mascot Layer (Pops up from phone and flaps wings on CTA hover) */}
          <FooterDuoMascot isPoppedUp={isInView} isHovered={isHovered} />
        </div>
      </div>

      {/* Official Duolingo Green Footer Navigation (Seamlessly flows from the green hills above) */}
      <div className="w-full bg-[#58CC02] text-white pt-6 sm:pt-10 pb-12 -mt-[2px] relative z-20">
        <div className="max-w-[1040px] mx-auto px-6">
          {/* Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
            {sections.map((sec) => (
              <div key={sec.title} className="flex flex-col gap-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-white/90">
                  {sec.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {sec.links.map((lnk) => (
                    <li key={lnk}>
                      <Link
                        href="/learn"
                        className="text-xs sm:text-sm font-bold text-white/80 hover:text-white hover:underline transition-colors"
                      >
                        {lnk}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom divider & language list */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-white/70">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span>Site language:</span>
              <span className="text-white underline cursor-pointer">English</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Español</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Français</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Deutsch</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Italiano</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">日本語</span>
            </div>

            <div>
              © {new Date().getFullYear()} Duolingo Clone • Crafted with 💚 by Ayush
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
