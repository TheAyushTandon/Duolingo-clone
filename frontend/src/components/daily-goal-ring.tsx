"use client";

import { Flame, Check } from "lucide-react";

import { useProfile, useTodayActivity } from "@/hooks/useUserData";

/**
 * Daily XP goal ring — the Duolingo-style circular indicator shown above
 * the learning path. Fills with today's earned XP against the goal and
 * switches to a celebratory state when the goal is met.
 */
export function DailyGoalRing() {
  const { data: profile } = useProfile();
  const { data: today } = useTodayActivity();

  const goal = profile?.daily_goal_xp ?? 50;
  const earned = today?.xp ?? 0;
  const progress = Math.min(1, goal > 0 ? earned / goal : 0);
  const complete = earned >= goal && goal > 0;

  // SVG ring geometry
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-3 py-2 select-none">
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="7"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={complete ? "#FFC800" : "#FF9600"}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="relative z-10">
          {complete ? (
            <Check size={30} strokeWidth={3.5} className="text-[#FFC800]" />
          ) : (
            <Flame
              size={30}
              className={progress > 0 ? "text-[#FF9600] fill-[#FF9600]" : "text-slate-300"}
            />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-black text-sm text-[var(--text-main)] uppercase tracking-wide">
          {complete ? "Daily goal complete!" : "Daily goal"}
        </h3>
        <p className="text-xs font-bold text-[var(--text-sub)] mt-0.5">
          {Math.min(earned, goal)} / {goal} XP today
        </p>
        {complete ? (
          <p className="text-[11px] font-black uppercase tracking-wider text-[#FFC800] mt-0.5">
            Keep going to earn more!
          </p>
        ) : (
          <p className="text-[11px] font-semibold text-[var(--text-sub)] mt-0.5">
            {Math.max(goal - earned, 0)} XP to go — keep your streak alive!
          </p>
        )}
      </div>
    </div>
  );
}
