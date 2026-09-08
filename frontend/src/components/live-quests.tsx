"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTodayActivity } from "@/hooks/useUserData";

/** Daily quests fed by today's real activity. */
const DAILY_XP_GOAL = 20;
const DAILY_LESSON_GOAL = 2;

export const LiveQuests = () => {
  const { data } = useTodayActivity();
  const earned = data?.xp ?? 0;
  const xpProgress = Math.min(100, Math.round((earned / DAILY_XP_GOAL) * 100));
  const lessonsDone = data?.lessons ?? 0;
  const lessonProgress = Math.min(100, Math.round((lessonsDone / DAILY_LESSON_GOAL) * 100));

  return (
    <div className="space-y-4 rounded-2xl border-2 border-[var(--border-color)] p-4 bg-[var(--bg-sidebar)] font-din">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-wide">
          Quests
        </h3>

        <Link href="/quests" prefetch>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs font-black text-[#1CB0F6] uppercase hover:underline p-0 h-auto hover:bg-transparent"
          >
            View all
          </Button>
        </Link>
      </div>

      <div className="w-full space-y-4">
        {/* Quest 1: Earn 20 XP */}
        <div className="flex w-full items-center gap-x-3">
          <Image src="/XP.svg" alt="XP" width={36} height={36} className="shrink-0" />
          <div className="flex w-full flex-col gap-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-[var(--text-main)]">
                Earn {DAILY_XP_GOAL} XP
              </span>
              <span className="font-extrabold text-[var(--text-sub)]">
                {Math.min(earned, DAILY_XP_GOAL)} / {DAILY_XP_GOAL} XP
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FFC800] transition-all duration-500"
                style={{ width: `${Math.max(earned > 0 ? 8 : 0, xpProgress)}%` }}
              />
            </div>
            {earned >= DAILY_XP_GOAL && (
              <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-500">
                <Zap size={12} className="fill-emerald-500" /> Completed!
              </p>
            )}
          </div>
        </div>

        {/* Quest 2: Complete 2 lessons */}
        <div className="flex w-full items-center gap-x-3">
          <Image src="/finish.svg" alt="Lessons" width={36} height={36} className="shrink-0" />
          <div className="flex w-full flex-col gap-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-[var(--text-main)]">
                Complete {DAILY_LESSON_GOAL} lessons
              </span>
              <span className="font-extrabold text-[var(--text-sub)]">
                {Math.min(lessonsDone, DAILY_LESSON_GOAL)} / {DAILY_LESSON_GOAL}
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-[var(--border-color)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#58CC02] transition-all duration-500"
                style={{ width: `${Math.max(lessonsDone > 0 ? 8 : 0, lessonProgress)}%` }}
              />
            </div>
            {lessonsDone >= DAILY_LESSON_GOAL && (
              <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-500">
                <Zap size={12} className="fill-emerald-500" /> Completed!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
