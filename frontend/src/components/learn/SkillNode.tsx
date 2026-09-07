"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  Crown, 
  Lock, 
  Star, 
  Sparkles, 
  Play, 
  BookOpen, 
  Coffee, 
  MessageCircle, 
  Compass,
  X 
} from "lucide-react";
import { SkillPathNode } from "@/types";
import { useSound } from "@/hooks/useSound";

interface SkillNodeProps {
  node: SkillPathNode;
  index: number;
  isCurrentActive?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star,
  dialogue: MessageCircle,
  coffee: Coffee,
  food: Coffee,
  travel: Compass,
  book: BookOpen,
  default: Star,
};

export function SkillNode({ node, index, isCurrentActive = false }: SkillNodeProps) {
  const { playClick } = useSound();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Generative sinusoidal horizontal offset
  const xOffset = Math.sin(index * 0.9) * 55;

  const isCompleted = node.state === "COMPLETED";
  const isLocked = node.state === "LOCKED";
  const isAvailable = node.state === "AVAILABLE" || node.state === "IN_PROGRESS";

  // Pick appropriate icon
  const IconComponent = ICON_MAP[node.icon] || ICON_MAP.default;

  // Find next lesson to do
  const activeLesson = node.lessons[0] || { id: "lesson_intro_1", title: node.title, xp_reward: 10 };

  // Radial progress calculations (radius = 42, circumference ~ 264)
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * (node.progress_percentage || 0)) / 100;

  return (
    <div
      className={`relative flex flex-col items-center my-6 select-none ${
        isPopoverOpen ? "z-30" : "z-10"
      }`}
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      {/* Floating Bouncing Speech Bubble for Current Active Node */}
      {isCurrentActive && !isPopoverOpen && (
        <div className="absolute -top-12 z-20 animate-bounce cursor-pointer" onClick={() => setIsPopoverOpen(true)}>
          <div className="relative bg-white border-2 border-slate-200 px-3.5 py-1.5 rounded-2xl shadow-md font-black text-xs text-[#58cc02] uppercase tracking-wider flex items-center gap-1">
            <span>START</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
          </div>
        </div>
      )}

      {/* Crown Badge for Completed Node */}
      {isCompleted && (
        <div className="absolute -top-3 right-0 z-20 w-7 h-7 rounded-full bg-[#ffc800] border-2 border-white shadow-md flex items-center justify-center text-white">
          <Crown size={14} className="fill-white" />
        </div>
      )}

      {/* Outer Progress Ring + Tactile Button Container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* SVG Radial Progress Ring */}
        {isAvailable && node.progress_percentage > 0 && (
          <svg className="absolute inset-0 w-24 h-24 -rotate-90 pointer-events-none z-10" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#ffc800"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* 3D Circular Node Button */}
        <button
          onClick={() => {
            if (!isLocked) {
              playClick();
              setIsPopoverOpen(!isPopoverOpen);
            }
          }}
          disabled={isLocked}
          aria-label={node.title}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 relative ${
            isCompleted
              ? "bg-[#ffc800] border-b-4 border-[#d19500] shadow-[0_6px_0_#d19500] hover:brightness-105 active:translate-y-1 active:shadow-none text-white"
              : isAvailable
              ? "bg-[#58cc02] border-b-4 border-[#46a302] shadow-[0_6px_0_#46a302] hover:brightness-105 active:translate-y-1 active:shadow-none text-white"
              : "bg-[#e5e5e5] border-b-4 border-[#c0c0c0] shadow-[0_6px_0_#c0c0c0] text-slate-400 cursor-not-allowed"
          }`}
        >
          {isCompleted ? (
            <Check size={36} strokeWidth={3.5} />
          ) : isLocked ? (
            <Lock size={30} strokeWidth={2.5} />
          ) : (
            <IconComponent size={34} className={isCurrentActive ? "animate-pulse" : ""} />
          )}
        </button>
      </div>

      {/* Floating Popover on Click */}
      {isPopoverOpen && (
        <div className="absolute top-24 z-50 w-72 bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="font-black text-[11px] uppercase tracking-wider text-slate-400 block">
                {isCompleted ? "Skill Mastered" : `Level ${node.level} of ${node.total_levels}`}
              </span>
              <h4 className="font-black text-base text-slate-800 leading-tight">
                {node.title}
              </h4>
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-500 mb-4">
            {node.description}
          </p>

          <Link
            href={`/lesson/${activeLesson.id}`}
            onClick={playClick}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all ${
              isCompleted
                ? "bg-[#ffc800] text-white hover:bg-[#e5a500] shadow-[0_4px_0_#d19500] active:translate-y-0.5 active:shadow-none"
                : "bg-[#58cc02] text-white hover:bg-[#46a302] shadow-[0_4px_0_#46a302] active:translate-y-0.5 active:shadow-none"
            }`}
          >
            <Play size={16} className="fill-current" />
            <span>{isCompleted ? "PRACTICE +10 XP" : `START +${activeLesson.xp_reward || 10} XP`}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
