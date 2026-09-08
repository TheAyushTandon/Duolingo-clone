"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroAnimationVideo } from "@/components/landing/HeroAnimationVideo";
import { LanguageRibbon } from "@/components/landing/LanguageRibbon";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import LearnAnywhereSection from "@/components/landing/LearnAnywhereSection";
import SuperDuolingoSection from "@/components/landing/SuperDuolingoSection";
import DuolingoEnglishTestSection from "@/components/landing/DuolingoEnglishTestSection";
import LandingFooter from "@/components/landing/LandingFooter";
import CreatorBadge from "@/components/landing/CreatorBadge";
import { AuthModal } from "@/components/auth/AuthModal";
import { getStoredToken } from "@/lib/api";
import { useSound } from "@/hooks/useSound";

export default function LandingPage() {
  const router = useRouter();
  const { playClick } = useSound();

  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: "login" | "register";
  }>({
    isOpen: false,
    mode: "register",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      if (auth === "login" || auth === "register") {
        setAuthModalState({
          isOpen: true,
          mode: auth,
        });
      }
    }
  }, []);

  const handleOpenAuth = (mode: "login" | "register") => {
    playClick();
    setAuthModalState({ isOpen: true, mode });
  };

  const handleAlreadyAccount = () => {
    playClick();
    const token = getStoredToken();
    if (token) {
      router.push("/learn");
    } else {
      setAuthModalState({ isOpen: true, mode: "login" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#4B4B4B] flex flex-col selection:bg-[#A5ED6E] selection:text-[#4B4B4B] overflow-x-clip max-w-[100vw]">
      {/* 100% Full Viewport Hero Container */}
      <div className="min-h-screen flex flex-col justify-between select-none">
        {/* Top Header with Duolingo Wordmark and Site Language Dropdown */}
        <LandingHeader onOpenAuth={handleOpenAuth} />

        {/* Main Hero Section (Vertically Centered) */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 py-4">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 my-auto">
            {/* Left Column: Lottie/WebM Animated Video */}
            <div className="w-full lg:w-1/2 flex justify-center items-center">
              <HeroAnimationVideo />
            </div>

            {/* Right Column: Hero Typography & Call-To-Action Buttons */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7">
              <h1 className="font-din text-[32px] sm:text-[36px] lg:text-[40px] text-[#222222] leading-[1.25] tracking-tight max-w-[460px]">
                The most fun way to learn languages, chess, and more!
              </h1>

              {/* 3D Action Buttons */}
              <div className="w-full max-w-[330px] flex flex-col gap-3.5 pb-16">
                {/* Primary Green CTA: Opens Register Modal */}
                <button
                  onClick={() => handleOpenAuth("register")}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#58CC02] text-white font-black text-[15px] uppercase tracking-wider text-center shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  GET STARTED
                </button>

                {/* Secondary White/Blue CTA: Logs in or routes to learn */}
                <button
                  onClick={handleAlreadyAccount}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white border-2 border-[#E5E5E5] text-[#1CB0F6] font-black text-[15px] uppercase tracking-wider text-center shadow-[0_4px_0_#E5E5E5] hover:bg-slate-50 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  I ALREADY HAVE AN ACCOUNT
                </button>
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

      {/* Auth Modal (Register / Login) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() =>
          setAuthModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
