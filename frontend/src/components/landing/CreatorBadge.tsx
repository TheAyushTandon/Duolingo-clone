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
              <div className="mb-2">
                <h4 className="font-feather text-base font-black text-[#4B4B4B] leading-none mb-1">
                  Ayush Tandon
                </h4>
                <p className="text-[10px] font-bold text-[#58CC02] uppercase tracking-wider">
                  Creator & Developer
                </p>
              </div>

              <p className="text-xs text-[#777777] font-medium leading-relaxed mb-3">
                Created by Ayush Tandon.
              </p>

              <div className="p-2.5 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] text-xs mb-3">
                <span className="text-[#AFAFAF] font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                  Portfolio Website
                </span>
                <a
                  href="https://theayushtandon.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1CB0F6] hover:text-[#1899D6] hover:underline font-bold inline-flex items-center gap-1"
                >
                  TheAyushTandon.in
                  <span className="text-[10px]">↗</span>
                </a>
              </div>

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
          className="group flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2 sm:py-2.5 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#58CC02] shadow-[0_4px_0_#E5E5E5] hover:shadow-[0_4px_0_#58CC02] active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer"
          title="Duolingo Clone created by Ayush Tandon"
          aria-label="Creator: Ayush Tandon"
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
              Ayush Tandon
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
