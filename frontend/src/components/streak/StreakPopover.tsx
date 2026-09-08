"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface StreakPopoverProps {
  streak: number;
  streakActiveToday?: boolean;
  activeDays?: string[];
  align?: "left" | "right";
  children: React.ReactNode;
}

export function StreakPopover({
  streak,
  streakActiveToday = false,
  activeDays = [],
  align = "left",
  children,
}: StreakPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Day of week calculation: Sunday = 0, Monday = 1, ... Saturday = 6
  const today = new Date();
  const todayDayIdx = today.getDay();

  const daysOfWeek = [
    { label: "S", full: "Sunday", dayIdx: 0 },
    { label: "M", full: "Monday", dayIdx: 1 },
    { label: "T", full: "Tuesday", dayIdx: 2 },
    { label: "W", full: "Wednesday", dayIdx: 3 },
    { label: "T", full: "Thursday", dayIdx: 4 },
    { label: "F", full: "Friday", dayIdx: 5 },
    { label: "S", full: "Saturday", dayIdx: 6 },
  ];

  const days = daysOfWeek.map((d) => {
    const isToday = d.dayIdx === todayDayIdx;
    
    // Calculate the calendar date for this day of the current week (Sunday to Saturday)
    const targetDate = new Date(today);
    const diffDays = d.dayIdx - todayDayIdx;
    targetDate.setDate(today.getDate() + diffDays);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const localIso = `${year}-${month}-${day}`;

    const utcYear = targetDate.getUTCFullYear();
    const utcMonth = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
    const utcDay = String(targetDate.getUTCDate()).padStart(2, "0");
    const utcIso = `${utcYear}-${utcMonth}-${utcDay}`;

    // A day is completed in the streak if:
    // 1) Streak is > 0
    // 2) If active today: the streak consists of the `streak` days ending on today (todayDayIdx)
    // 3) If not active today: the streak consists of the `streak` days ending yesterday (todayDayIdx - 1)
    const isCompleted =
      streak > 0 &&
      (streakActiveToday
        ? d.dayIdx <= todayDayIdx && d.dayIdx > todayDayIdx - streak
        : d.dayIdx < todayDayIdx && d.dayIdx >= todayDayIdx - streak);

    return {
      ...d,
      isToday,
      isCompleted: Boolean(isCompleted),
    };
  });

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <div 
        className="cursor-pointer"
        onClick={handleClick}
        data-testid="streak-trigger"
      >
        {children}
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div
          className={`absolute top-full pt-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-1/2 -translate-x-[75px]"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Main Card Container */}
          <div className="relative w-[340px] bg-[#131F24] border-2 border-[#233139] rounded-3xl p-5 shadow-2xl font-din select-none">
            {/* Upward triangular pointer arrow aligning with streak icon */}
            <div
              className={`absolute -top-[9px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[9px] border-b-[#233139] ${
                align === "right" ? "right-8" : "left-[67px]"
              }`}
            >
              <div className="absolute -left-[7px] top-[2px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[8px] border-b-[#131F24]" />
            </div>

            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h3 className="font-din font-black text-xl text-[#4F6573] tracking-wide">
                  {streak} day streak
                </h3>
                <p className="font-din font-bold text-sm text-white leading-tight">
                  {streakActiveToday
                    ? "Great job! You extended your streak today!"
                    : "Do a lesson today to extend your streak!"}
                </p>
              </div>

              {/* Flame Silhouette Icon */}
              <div className="w-14 h-16 shrink-0 relative flex items-center justify-center">
                <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
                  {/* Outer flame shape */}
                  <path
                    d="M26 2 C32 12 48 24 48 38 C48 50 38 58 26 58 C14 58 4 50 4 38 C4 26 18 16 20 8 C21 5 23 3 26 2 Z"
                    fill={streak > 0 ? "#FF9600" : "#23323B"}
                    className="transition-colors"
                  />
                  {/* Inner drop silhouette */}
                  <path
                    d="M26 24 C30 30 36 36 36 43 C36 49 31.5 53 26 53 C20.5 53 16 49 16 43 C16 36 23 30 26 24 Z"
                    fill={streak > 0 ? "#FFC800" : "#131F24"}
                    className="transition-colors"
                  />
                </svg>
              </div>
            </div>

            {/* 7 Days of the Week Row */}
            <div className="w-full bg-[#10191E] rounded-2xl p-3.5 mb-4 border border-[#1B272E]">
              <div className="grid grid-cols-7 gap-1.5 text-center items-center">
                {days.map((d) => (
                  <div key={d.dayIdx} className="flex flex-col items-center gap-1.5">
                    {/* Day Letter */}
                    <span
                      className={`font-din font-black text-xs uppercase ${
                        d.isToday ? "text-[#FF9600]" : "text-[#526571]"
                      }`}
                    >
                      {d.label}
                    </span>

                    {/* Day Indicator Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        d.isCompleted
                          ? "bg-[#FF9600] text-[#131F24] shadow-sm"
                          : "bg-[#24333C]"
                      }`}
                    >
                      {d.isCompleted && (
                        <Check size={16} strokeWidth={4} className="text-[#131F24]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Society Card */}
            <div className="w-full bg-[#10191E] border-2 border-[#233139] rounded-2xl p-3.5 flex items-center gap-3.5 mb-4">
              {/* Padlock Icon */}
              <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl">
                <svg width="34" height="38" viewBox="0 0 34 38" fill="none">
                  {/* Shackle */}
                  <path
                    d="M10 16 V11 C10 7.1 13.1 4 17 4 C20.9 4 24 7.1 24 11 V16"
                    stroke="#3A4B56"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Lock Body */}
                  <rect x="5" y="15" width="24" height="20" rx="5" fill="#3A4B56" />
                  {/* Keyhole */}
                  <circle cx="17" cy="23" r="2.2" fill="#10191E" />
                  <path d="M16 23 L18 23 L17.5 29 L16.5 29 Z" fill="#10191E" />
                </svg>
              </div>

              {/* Text */}
              <div className="flex-1 space-y-0.5">
                <h4 className="font-din font-black text-sm text-white leading-tight">
                  Streak Society
                </h4>
                <p className="font-din font-bold text-xs text-[#8097A2] leading-snug">
                  Reach a 7 day streak to join the Streak Society and earn exclusive rewards.
                </p>
              </div>
            </div>

            {/* View More Button */}
            <Link
              href="/quests"
              className="w-full py-3 rounded-2xl font-din font-black text-xs uppercase tracking-wider text-white bg-[#1CB0F6] hover:bg-[#1899D6] shadow-[0_4px_0_#1899D6] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center text-center"
            >
              VIEW MORE
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
