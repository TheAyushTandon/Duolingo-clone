"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Zap, Flame, Target, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { LessonCompleteResponse } from "@/types";
import { DuoMascot } from "@/components/mascot/DuoMascot";
import { useSound } from "@/hooks/useSound";

interface LessonCompleteModalProps {
  data: LessonCompleteResponse;
  accuracy: number;
}

export function LessonCompleteModal({ data, accuracy }: LessonCompleteModalProps) {
  const router = useRouter();
  const { playFanfare, playClick } = useSound();

  useEffect(() => {
    // Play sound & fire festive confetti
    playFanfare();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#58cc02", "#ffc800", "#1cb0f6", "#ff4b4b", "#ce82ff"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#58cc02", "#ffc800", "#1cb0f6", "#ff4b4b", "#ce82ff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [playFanfare]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        {/* Celebrating Mascot */}
        <div className="w-40 h-40">
          <DuoMascot mood="celebrate" className="w-full h-full" />
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#ffc800] tracking-tight">
            Lesson Complete!
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            You are making fantastic language progress!
          </p>
        </div>

        {/* Gamification Reward Cards Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* XP Card */}
          <div className="p-4 rounded-3xl border-2 border-amber-300 bg-amber-50 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-1">
              TOTAL XP
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-black text-2xl">
              <Zap size={22} className="fill-amber-500" />
              <span>+{data.xp_awarded}</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="p-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
              ACCURACY
            </span>
            <div className="flex items-center gap-1 text-emerald-600 font-black text-2xl">
              <Target size={22} />
              <span>{Math.round(accuracy)}%</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="p-4 rounded-3xl border-2 border-orange-300 bg-orange-50 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-1">
              STREAK
            </span>
            <div className="flex items-center gap-1 text-orange-500 font-black text-2xl">
              <Flame size={22} className="fill-orange-500" />
              <span>{data.streak}</span>
            </div>
          </div>
        </div>

        {/* New Achievements Banner */}
        {data.new_achievements && data.new_achievements.length > 0 && (
          <div className="w-full p-4 rounded-3xl bg-purple-50 border-2 border-purple-200 text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Trophy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-purple-600">
                <Sparkles size={12} />
                Achievement Unlocked!
              </div>
              <h5 className="font-black text-slate-800 text-sm">
                {data.new_achievements[0].name}
              </h5>
              <p className="text-xs font-semibold text-slate-500">
                {data.new_achievements[0].description} (+{data.new_achievements[0].xp_reward} XP)
              </p>
            </div>
          </div>
        )}

        {/* Continue to Learning Path Button */}
        <button
          onClick={() => {
            playClick();
            router.push("/learn");
          }}
          className="w-full py-4 rounded-2xl bg-[#58cc02] text-white font-black text-base uppercase tracking-wider shadow-[0_5px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <span>CONTINUE</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
