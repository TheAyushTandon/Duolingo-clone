"use client";

import React from "react";
import Link from "next/link";
import { ScrollTriggeredVideo } from "./ScrollTriggeredVideo";
import { useTranslation } from "@/stores/useLanguageStore";

export default function FeatureShowcase() {
  const { t, language } = useTranslation();

  return (
    <section className="w-full pt-16 sm:pt-24 pb-12 sm:pb-16 bg-white select-none relative z-10">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col gap-24 sm:gap-36">
        {/* Feature 1: free. fun. effective. (DIN Font) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 xl:gap-32">
          {/* Left: Text & Anchor Tag */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="font-din text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] mb-5">
              {t("free. fun. effective.")}
            </h2>
            <p className="text-base sm:text-lg text-[#777777] font-medium leading-[1.65] max-w-md">
              {language === "hi" ? (
                <>
                  डुओलिंगो के साथ सीखना मज़ेदार है और{" "}
                  <Link
                    href="/efficiency"
                    className="text-[#1CB0F6] font-bold hover:underline"
                  >
                    शोध बताते हैं कि यह कारगर है
                  </Link>
                  ! छोटे-छोटे पाठों के साथ पॉइंट्स कमाएं और नए स्तर अनलॉक करें।
                </>
              ) : (
                <>
                  Learning with Duolingo is fun, and{" "}
                  <Link
                    href="/efficiency"
                    className="text-[#1CB0F6] font-bold hover:underline"
                  >
                    research shows that it works
                  </Link>
                  ! With quick, bite-sized lessons, you&apos;ll earn points and unlock
                  new levels while gaining real-world communication skills.
                </>
              )}
            </p>
          </div>

          {/* Right: Scroll-Triggered Dual Video (Video 3 then loop Video 4) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <ScrollTriggeredVideo
              initialSrc="/assets/Video Project 3.webm"
              loopSrc="/assets/Video Project 4 end.webm"
              className="max-w-[480px] lg:max-w-[520px]"
            />
          </div>
        </div>

        {/* Feature 2: backed by science (Feather Font) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 xl:gap-32">
          {/* Left: Scroll-Triggered Dual Video (Video 5 then loop Video 6) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-2 lg:order-1">
            <ScrollTriggeredVideo
              initialSrc="/assets/Video Project 5 start.webm"
              loopSrc="/assets/Video Project 6 end.webm"
              className="max-w-[480px] lg:max-w-[520px]"
            />
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
            <h2 className="font-feather text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] mb-5">
              {t("backed by science")}
            </h2>
            <p className="text-base sm:text-lg text-[#777777] font-medium leading-[1.65] max-w-md">
              {t("We use a combination of research-backed teaching methods and delightful content to create courses that effectively teach reading, writing, listening, and speaking skills!")}
            </p>
          </div>
        </div>

        {/* Feature 3: stay motivated (Feather Font) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 xl:gap-32">
          {/* Left: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="font-feather text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] mb-5">
              {t("stay motivated")}
            </h2>
            <p className="text-base sm:text-lg text-[#777777] font-medium leading-[1.65] max-w-md">
              {t("We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders from our friendly mascot, Duo the owl.")}
            </p>
          </div>

          {/* Right: Scroll-Triggered Dual Video (Video 7 then loop Video 8) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <ScrollTriggeredVideo
              initialSrc="/assets/Video Project 7 start.webm"
              loopSrc="/assets/Video Project 8 end.webm"
              className="max-w-[480px] lg:max-w-[520px]"
            />
          </div>
        </div>

        {/* Feature 4: personalized learning (Feather Font) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 xl:gap-32">
          {/* Left: Scroll-Triggered Dual Video (Video 9 then loop Video 10) */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-2 lg:order-1">
            <ScrollTriggeredVideo
              initialSrc="/assets/Video Project 9 start.webm"
              loopSrc="/assets/Video Project 10 end.webm"
              className="w-full max-w-[540px] lg:max-w-[580px] !aspect-[1235/1080]"
              videoClassName="!scale-[1.015] !object-cover"
            />
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
            <h2 className="font-feather text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#58CC02] lowercase leading-[1.15] mb-5">
              {t("personalized learning")}
            </h2>
            <p className="text-base sm:text-lg text-[#777777] font-medium leading-[1.65] max-w-md">
              {t("Combining the best of AI and language science, lessons are tailored to help you learn at just the right level and pace.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
