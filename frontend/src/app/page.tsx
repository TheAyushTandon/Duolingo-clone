"use client";

import React from "react";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroAnimationVideo } from "@/components/landing/HeroAnimationVideo";
import { LanguageRibbon } from "@/components/landing/LanguageRibbon";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import LearnAnywhereSection from "@/components/landing/LearnAnywhereSection";
import SuperDuolingoSection from "@/components/landing/SuperDuolingoSection";
import DuolingoEnglishTestSection from "@/components/landing/DuolingoEnglishTestSection";
import LandingFooter from "@/components/landing/LandingFooter";
import CreatorBadge from "@/components/landing/CreatorBadge";
import { useSound } from "@/hooks/useSound";

export default function LandingPage() {
  const { playClick } = useSound();

  return (
    <div className="min-h-screen bg-white text-[#4B4B4B] flex flex-col selection:bg-[#A5ED6E] selection:text-[#4B4B4B] overflow-x-clip max-w-[100vw]">
      {/* 100% Full Viewport Hero Container */}
      <div className="h-screen min-h-[640px] flex flex-col justify-between select-none">
        {/* Top Header with Duolingo Wordmark and Site Language Dropdown */}
        <LandingHeader />

        {/* Main Hero Section (Vertically Centered) */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 py-4">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 my-auto">
            {/* Left Column: Lottie/WebM Animated Video */}
            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <HeroAnimationVideo />
            </div>

            {/* Right Column: Hero Typography & Call-To-Action Buttons */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7">
              <h1 className="font-din text-[32px] sm:text-[36px] lg:text-[40px] text-[#4B4B4B] leading-[1.25] tracking-tight max-w-[460px]">
                The most fun way to learn languages, chess, and more!
              </h1>

              {/* 3D Action Buttons */}
              <div className="w-full max-w-[330px] flex flex-col gap-3.5">
                {/* Primary Green CTA */}
                <Link
                  href="/learn"
                  onClick={playClick}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-wider text-center shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  GET STARTED
                </Link>

                {/* Secondary White/Blue CTA */}
                <Link
                  href="/learn"
                  onClick={playClick}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white border-2 border-[#E5E5E5] text-[#1CB0F6] font-black text-[15px] uppercase tracking-wider text-center shadow-[0_4px_0_#E5E5E5] hover:bg-slate-50 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  I ALREADY HAVE AN ACCOUNT
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Flag / Language Carousel Ribbon pinned to bottom of 100% viewport */}
        <LanguageRibbon />
      </div>

      {/* Marketing Feature Showcases */}
      <FeatureShowcase />

      {/* Learn Anytime, Anywhere Interactive Animated Section */}
      <LearnAnywhereSection />

      {/* Super Duolingo Promotion Section */}
      <SuperDuolingoSection />

      {/* Duolingo English Test Section */}
      <DuolingoEnglishTestSection />

      {/* Footer */}
      <LandingFooter />

      {/* Sticky Creator Differentiator Badge */}
      <CreatorBadge />
    </div>
  );
}
