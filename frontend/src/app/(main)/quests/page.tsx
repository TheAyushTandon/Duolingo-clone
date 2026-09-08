"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Sparkles, Trophy } from "lucide-react";

import { useTodayActivity, useProfile } from "@/hooks/useUserData";

const DAILY_XP_GOAL = 20;

export default function QuestsPage() {
  const { data: today } = useTodayActivity();
  const { data: profile } = useProfile();

  const earned = today?.xp ?? 0;
  const xpProgress = Math.min(100, Math.round((earned / DAILY_XP_GOAL) * 100));
  const lessonsDone = today?.lessons ?? 0;
  const lessonGoal = 2;
  const lessonProgress = Math.min(100, Math.round((lessonsDone / lessonGoal) * 100));

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 font-din">
      <StickyWrapper>
        <LiveUserProgress />

        {/* Monthly challenges unlock soon card */}
        <div className="rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#58CC02] tracking-tight">
                Monthly challenges unlock soon!
              </h3>
              <p className="text-xs font-bold text-[var(--text-sub)] leading-relaxed">
                Complete each month&apos;s challenge to earn exclusive badges
              </p>
            </div>
            <div className="relative shrink-0 flex items-center justify-center">
              <Image
                src="/monthly-challenges.svg"
                alt="Monthly Challenges"
                width={80}
                height={57}
                className="object-contain drop-shadow-sm"
              />
            </div>
          </div>
          <Link href="/learn">
            <Button
              variant="default"
              className="w-full bg-[#1CB0F6] hover:bg-[#1899D6] text-white border-b-4 border-[#1482B6] active:translate-y-0.5 active:border-b-2 font-black uppercase tracking-wider text-xs py-5 rounded-2xl transition-all"
            >
              Start a lesson
            </Button>
          </Link>
        </div>
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col gap-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#CE82FF] via-[#A855F7] to-[#7C3AED] p-6 text-white shadow-lg border-2 border-[#A855F7]/30">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} className="text-amber-300" />
                Daily Challenges
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome{profile ? `, ${profile.username.replace("_", " ")}` : ""}!
              </h2>
              <p className="text-sm font-bold text-purple-100">
                Complete daily quests to earn bonus XP and keep Duo satisfied!
              </p>
            </div>
          </div>

          {/* Daily Quests Header */}
          <div className="flex items-center justify-between pt-2">
            <h1 className="text-2xl font-black text-[var(--text-main)]">
              Daily Quests
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-black text-[#FF9600] bg-[#FF9600]/10 px-3 py-1 rounded-xl border border-[#FF9600]/20">
              <span>⏱ RESETS AT MIDNIGHT</span>
            </div>
          </div>

          {/* Daily Quest: Earn XP */}
          <div className="rounded-2xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 transition-transform hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFC800]/15 border-2 border-[#FFC800]/30 flex items-center justify-center shrink-0">
                <Zap className="w-7 h-7 text-[#FFC800] fill-[#FFC800]" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base text-[var(--text-main)]">
                    Earn {DAILY_XP_GOAL} XP
                  </span>
                  <span className="font-extrabold text-xs text-[var(--text-sub)]">
                    {Math.min(earned, DAILY_XP_GOAL)} / {DAILY_XP_GOAL} XP
                  </span>
                </div>
                <div className="relative h-5 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
                  <div
                    className="h-full bg-[#FFC800] rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(5, xpProgress)}%` }}
                  >
                    <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFC800]/10 border-2 border-[#FFC800]/30 shadow-sm">
                <Image src="/quests.svg" alt="Chest" width={32} height={32} />
              </div>
            </div>
          </div>

          {/* Daily Quest: Complete lessons */}
          <div className="rounded-2xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 transition-transform hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/15 border-2 border-[#58CC02]/30 flex items-center justify-center shrink-0">
                <Image src="/finish.svg" alt="Lessons" width={28} height={28} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base text-[var(--text-main)]">
                    Complete {lessonGoal} lessons
                  </span>
                  <span className="font-extrabold text-xs text-[var(--text-sub)]">
                    {Math.min(lessonsDone, lessonGoal)} / {lessonGoal}
                  </span>
                </div>
                <div className="relative h-5 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
                  <div
                    className="h-full bg-[#58CC02] rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(5, lessonProgress)}%` }}
                  >
                    <div className="absolute top-0.5 left-2 right-2 h-1 bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-[#58CC02]/10 border-2 border-[#58CC02]/30 shadow-sm">
                <Image src="/quests.svg" alt="Chest" width={32} height={32} />
              </div>
            </div>
          </div>

          {/* Locked Quest item */}
          <div className="rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 opacity-70">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--border-color)]/60 flex items-center justify-center text-[var(--text-sub)] shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-base text-[var(--text-main)]">
                  More quests unlock tomorrow
                </h4>
                <p className="font-bold text-xs text-[var(--text-sub)]">
                  Keep expanding your streak to unlock special weekend challenges
                </p>
              </div>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
