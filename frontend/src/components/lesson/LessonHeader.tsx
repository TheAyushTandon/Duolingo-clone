"use client";

import React from "react";
import { X, Heart } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface LessonHeaderProps {
  currentIndex: number;
  totalExercises: number;
  hearts: number;
  onQuitClick: () => void;
  heartLostTrigger?: boolean;
}

export function LessonHeader({
  currentIndex,
  totalExercises,
  hearts,
  onQuitClick,
  heartLostTrigger = false,
}: LessonHeaderProps) {
  const { playClick } = useSound();

  const progressPercent = totalExercises > 0 
    ? Math.min(100, Math.max(5, (currentIndex / totalExercises) * 100))
    : 0;

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center gap-4 sm:gap-6 select-none">
      {/* Quit Button */}
      <button
        onClick={() => {
          playClick();
          onQuitClick();
        }}
        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Quit lesson"
      >
        <X size={26} strokeWidth={2.8} />
      </button>

      {/* Fluid Progress Bar */}
      <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden p-0.5 relative">
        <div
          className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Subtle shine highlight */}
          <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Hearts Counter */}
      <div
        className={`flex items-center gap-1.5 font-black text-base text-[#ff4b4b] transition-transform duration-300 ${
          heartLostTrigger ? "animate-bounce scale-125" : ""
        }`}
      >
        <Heart size={26} className="fill-[#ff4b4b]" />
        <span>{hearts}</span>
      </div>
    </header>
  );
}
