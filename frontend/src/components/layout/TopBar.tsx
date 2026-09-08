"use client";

import React, { useState } from "react";
import { Flame, Gem, Heart, Sparkles, Plus, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLearningPath, refillHearts } from "@/lib/api";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { StreakPopover } from "@/components/streak/StreakPopover";

export function TopBar() {
  const queryClient = useQueryClient();
  const { playClick, playCorrect, playHeartLost } = useSound();
  const [activePopover, setActivePopover] = useState<"streak" | "gems" | "hearts" | null>(null);

  const { data } = useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
    staleTime: 1000 * 30, // 30s
  });

  const refillMutation = useMutation({
    mutationFn: (isPractice: boolean) => refillHearts(isPractice),
    onSuccess: () => {
      playCorrect();
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      setActivePopover(null);
    },
    onError: () => {
      playHeartLost();
    }
  });

  const stats = data?.user_stats || {
    xp: 0,
    gems: 0,
    hearts: 5,
    max_hearts: 5,
    streak: 0,
  };

  const course = data?.course || {
    title: "Spanish",
    flag_icon: "🇪🇸",
  };

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between z-30 select-none">
      {/* Course Selector / Flag */}
      <div className="flex items-center gap-3">
        <Link
          href="/learn"
          onClick={playClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <span className="text-2xl leading-none">{course.flag_icon}</span>
          <span className="font-extrabold text-sm text-slate-700 hidden sm:inline">
            {course.title}
          </span>
        </Link>
      </div>

      {/* Gamification Stats Bar */}
      <div className="flex items-center gap-2 sm:gap-6">
        <StreakPopover
          streak={stats.streak}
          streakActiveToday={stats.streak_active_today}
          activeDays={stats.active_days}
          align="right"
        >
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm tracking-wide transition-all cursor-pointer ${
              stats.streak > 0
                ? "text-[#FF9600] hover:bg-amber-500/10"
                : "text-[var(--text-sub)] hover:bg-[var(--border-color)]/30"
            }`}
          >
            <Image
              src="/streak.svg"
              width={22}
              height={22}
              alt="Streak"
              className={`transition-all ${
                stats.streak > 0
                  ? "drop-shadow-[0_0_8px_rgba(255,150,0,0.5)] animate-pulse"
                  : "grayscale opacity-40"
              }`}
            />
            <span>{stats.streak}</span>
          </div>
        </StreakPopover>

        {/* Gems Item */}
        <div className="relative">
          <button
            onClick={() => {
              playClick();
              setActivePopover(activePopover === "gems" ? null : "gems");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm text-[#1cb0f6] hover:bg-sky-50 transition-all tracking-wide"
          >
            <Image src="/points.svg" width={20} height={20} alt="Gems" />
            <span>{stats.gems}</span>
          </button>

          {/* Gems Popover */}
          {activePopover === "gems" && (
            <div className="absolute right-0 top-12 w-64 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <Image src="/points.svg" width={22} height={22} alt="Gems" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">
                    {stats.gems} Gems
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    Use gems in the shop
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-semibold mb-3">
                Earn gems by finishing lessons, maintaining streaks, and leveling up your language skills!
              </p>
              <Link
                href="/shop"
                onClick={() => {
                  playClick();
                  setActivePopover(null);
                }}
                className="block text-center py-2 rounded-xl bg-[#1cb0f6] text-white font-black text-xs uppercase tracking-wider hover:bg-[#1899d6] transition-colors"
              >
                Go to Shop
              </Link>
            </div>
          )}
        </div>

        {/* Hearts Item */}
        <div className="relative">
          <button
            onClick={() => {
              playClick();
              setActivePopover(activePopover === "hearts" ? null : "hearts");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm text-[#ff4b4b] hover:bg-rose-50 transition-all tracking-wide"
          >
            <Image src="/heart.svg" width={20} height={20} alt="Hearts" />
            <span>{stats.hearts}</span>
          </button>

          {/* Hearts Popover */}
          {activePopover === "hearts" && (
            <div className="absolute right-0 top-12 w-72 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Image src="/heart.svg" width={24} height={24} alt="Hearts" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">
                    Hearts: {stats.hearts}/{stats.max_hearts}
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    {stats.hearts === stats.max_hearts ? "Full hearts!" : "Regenerates 1 per 30 min"}
                  </p>
                </div>
              </div>

              {stats.hearts < stats.max_hearts ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 font-semibold">
                    You lose a heart when you answer an exercise incorrectly. Refill now or earn hearts through practice!
                  </p>
                  <button
                    onClick={() => refillMutation.mutate(false)}
                    disabled={refillMutation.isPending || stats.gems < 350}
                    className="w-full py-2 px-3 rounded-xl bg-[#ff4b4b] text-white font-black text-xs uppercase tracking-wider flex items-center justify-between hover:bg-[#e03838] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Refill Hearts</span>
                    <span className="flex items-center gap-1 font-extrabold text-[11px]">
                      350 <Gem size={12} className="fill-white" />
                    </span>
                  </button>

                  <button
                    onClick={() => refillMutation.mutate(true)}
                    disabled={refillMutation.isPending}
                    className="w-full py-2 px-3 rounded-xl border-2 border-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors text-center"
                  >
                    Free Practice Refill (+1 ❤️)
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-[#58cc02] mb-1">
                    <Check size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-600">
                    You have maximum hearts! You are ready to tackle any lesson challenge.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
