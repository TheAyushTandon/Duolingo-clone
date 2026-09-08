"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";

export default function DuolingoEnglishTestSection() {
  const { playClick } = useSound();
  const { t } = useTranslation();

  return (
    <section
      className="w-full bg-white py-16 sm:py-24 lg:py-28 px-6 select-none border-t border-[#E5E5E5]/60 relative z-10"
      aria-label="Duolingo English Test"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 xl:gap-24">
        {/* Left Column: Heading, Description, 3D Outlined CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          {/* Section Heading in Duolingo Feather font */}
          <h2 className="font-feather text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] mb-5 tracking-tight">
            {t("duolingo english test")}
          </h2>

          {/* Descriptive Body Paragraph */}
          <p className="text-base sm:text-[17px] text-[#777777] font-medium leading-[1.65] max-w-[473px] mb-8">
            {t("Our convenient, fast, and affordable English test integrates the latest assessment science and AI — empowering anyone to accurately test their English where and when they’re at their best.")}
          </p>

          {/* 3D Tactile Outlined CTA Button */}
          <div>
            <a
              href="https://englishtest.duolingo.com/en"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="inline-flex items-center justify-center bg-white border-2 border-[#E5E5E5] text-[#1CB0F6] font-black uppercase text-[15px] tracking-[0.8px] px-8 py-3.5 sm:py-4 rounded-2xl shadow-[0_2px_0_#E5E5E5] hover:bg-slate-50 hover:border-[#1CB0F6]/50 hover:shadow-[0_2px_0_#1CB0F6]/20 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer select-none"
            >
              {t("CERTIFY YOUR ENGLISH")}
            </a>
          </div>
        </motion.div>

        {/* Right Column: Interactive Animated SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex items-center justify-center"
        >
          {/* Floating Levitation Loop with Smooth Hover Response */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.03,
              rotate: 1,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[530px] aspect-square flex items-center justify-center cursor-pointer"
          >
            <img
              src="/assets/duolingo-english-test.svg"
              alt="Duolingo English Test - Bea holding certification badge on smartphone"
              width={530}
              height={530}
              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
