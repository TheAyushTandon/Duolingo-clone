"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, InfinityIcon } from "lucide-react";

import { COURSE_FLAGS } from "@/types";
import { useLearningPath } from "@/hooks/useUserData";
import { ThemeToggle } from "@/components/theme-toggle";
import { StreakPopover } from "@/components/streak/StreakPopover";

/**
 * Live replacement for the mock UserProgress widget: course flag, streak,
 * gems and hearts straight from the learning-path API.
 */
export function LiveUserProgress({ hasActiveSubscription = false }: { hasActiveSubscription?: boolean }) {
  const { data, isLoading } = useLearningPath();

  if (isLoading || !data) {
    return (
      <div className="flex w-full items-center justify-between gap-x-2 border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-2xl p-4">
        <div className="h-8 w-8 rounded-md bg-[var(--border-color)] animate-pulse" />
        <div className="h-6 w-12 rounded-full bg-[var(--border-color)] animate-pulse" />
        <div className="h-6 w-12 rounded-full bg-[var(--border-color)] animate-pulse" />
        <div className="h-6 w-12 rounded-full bg-[var(--border-color)] animate-pulse" />
      </div>
    );
  }

  const { course, user_stats } = data;

  return (
    <div className="flex w-full items-center justify-between gap-x-2 border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] rounded-2xl p-4">
      <Link href="/courses" prefetch aria-label="Switch course">
        <div className="transition-transform hover:scale-110 active:scale-95">
          <Image
            src={COURSE_FLAGS[course.code] || "/fr.svg"}
            alt={course.title}
            className="rounded-md border border-black/10 object-cover"
            width={36}
            height={27}
          />
        </div>
      </Link>

      <StreakPopover
        streak={user_stats.streak}
        streakActiveToday={user_stats.streak_active_today}
        activeDays={user_stats.active_days}
      >
        <div
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[var(--border-color)]/40 font-extrabold cursor-pointer ${
            user_stats.streak > 0 ? "text-[#FF9600]" : "text-[var(--text-sub)]"
          }`}
          aria-label="Streak"
        >
          <Image
            src="/streak.svg"
            height={24}
            width={24}
            alt="Streak"
            className={`transition-all ${
              user_stats.streak > 0
                ? "drop-shadow-[0_0_8px_rgba(255,150,0,0.5)] animate-pulse"
                : "grayscale opacity-40"
            }`}
          />
          <span className="text-sm">{user_stats.streak}</span>
        </div>
      </StreakPopover>

      <Link
        href="/shop"
        prefetch
        className="flex items-center gap-1.5 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--border-color)]/40 font-extrabold text-sky-500"
        aria-label="Gems"
      >
        <Image src="/points.svg" height={26} width={26} alt="Gems" />
        <span className="text-sm">{user_stats.gems}</span>
      </Link>

      <Link
        href="/shop"
        prefetch
        className="flex items-center gap-1.5 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--border-color)]/40 font-extrabold text-rose-500"
        aria-label="Hearts"
      >
        <Image src="/heart.svg" height={22} width={22} alt="Hearts" />
        {hasActiveSubscription ? (
          <InfinityIcon className="h-4 w-4" strokeWidth={3} />
        ) : (
          <span className="text-sm">{user_stats.hearts}</span>
        )}
      </Link>

      <div className="pl-1 border-l border-[var(--border-color)]">
        <ThemeToggle />
      </div>
    </div>
  );
}
