"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";

export default function CreatorBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const { playClick } = useSound();

  const handleToggle = () => {
    playClick();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none">
      <div className="relative">
        {/* Playful Duolingo-styled Tooltip / Popover Bubble */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-full right-0 mb-3 w-64 bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 shadow-[0_6px_0_#E5E5E5] text-left"
            >
              <div className="flex items-center gap-2.5 mb-2">
                {/* Mini Duo Owl Avatar */}
                <div className="w-7 h-7 rounded-xl bg-[#58CC02] flex items-center justify-center shadow-[0_2px_0_#46A302]">
                  <span className="text-sm">🦉</span>
                </div>
                <div>
                  <h4 className="font-feather text-sm font-black text-[#4B4B4B] leading-none">
                    Ayush
                  </h4>
                  <p className="text-[10px] font-bold text-[#58CC02] uppercase tracking-wider">
                    Creator & Developer
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#777777] font-medium leading-relaxed mb-3">
                Crafted this pixel-perfect Duolingo Clone featuring real Lottie scrub animations, WebM video pipelines, and reactive state.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0] text-[10px] font-bold text-[#AFAFAF]">
                <span>Duolingo Web Clone</span>
                <span className="text-[#58CC02] font-black">100% Interactive</span>
              </div>

              {/* Speech bubble downward triangle pointing to button */}
              <div className="absolute -bottom-2.5 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-[#E5E5E5] transform rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Sticky Tactile Pill Badge */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#58CC02] shadow-[0_4px_0_#E5E5E5] hover:shadow-[0_4px_0_#58CC02] active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
          title="Duolingo Clone by Ayush"
          aria-label="Creator: Ayush"
        >
          {/* Status Dot with Duo Green Ping */}
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58CC02] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#58CC02]" />
            </span>
          </div>

          {/* Label + Name in Official Duolingo Feather Font */}
          <div className="flex flex-col items-start leading-none text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#AFAFAF] group-hover:text-[#58CC02] transition-colors">
              Crafted By
            </span>
            <span className="text-[14px] sm:text-[15px] font-feather font-black text-[#4B4B4B] group-hover:text-[#111111] transition-colors mt-0.5">
              Ayush
            </span>
          </div>

          {/* Mini Duo Feather / Sparkle Icon */}
          <div className="w-5 h-5 rounded-lg bg-[#F7F7F7] group-hover:bg-[#E8F8D8] flex items-center justify-center transition-colors">
            <span className="text-xs group-hover:scale-110 transition-transform">✨</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
