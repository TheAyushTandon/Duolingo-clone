"use client";

import React from "react";
import { UnitBanner } from "./UnitBanner";
import { SkillNode } from "./SkillNode";
import { UnitPathItem } from "@/types";
import { Gift, Trophy } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface LearningPathProps {
  units: UnitPathItem[];
}

export function LearningPath({ units }: LearningPathProps) {
  const { playFanfare, playClick } = useSound();

  // Find the first available or in-progress skill across all units to highlight
  let activeFound = false;
  let activeSkillId: string | null = null;

  for (const unit of units) {
    for (const skill of unit.skills) {
      if (!activeFound && (skill.state === "IN_PROGRESS" || skill.state === "AVAILABLE")) {
        activeSkillId = skill.id;
        activeFound = true;
        break;
      }
    }
  }

  // Unit banner colors palette
  const BANNER_COLORS = [
    "bg-[#58cc02]", // Emerald Green
    "bg-[#1cb0f6]", // Sky Blue
    "bg-[#ce82ff]", // Lilac Purple
    "bg-[#ff9600]", // Sunset Orange
    "bg-[#ff4b4b]", // Rose Red
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 select-none pb-24">
      {units.map((unit, unitIdx) => {
        const bannerColor = BANNER_COLORS[unitIdx % BANNER_COLORS.length];

        return (
          <section key={unit.id} className="mb-14">
            {/* Unit Header Banner */}
            <UnitBanner
              unitIndex={unitIdx}
              title={unit.title}
              description={unit.description}
              bannerColor={bannerColor}
            />

            {/* Sinusoidal Skills Path */}
            <div className="flex flex-col items-center relative py-4">
              {unit.skills.map((skill, skillIdx) => {
                const isCurrentActive = skill.id === activeSkillId;

                return (
                  <React.Fragment key={skill.id}>
                    <SkillNode
                      node={skill}
                      index={skillIdx}
                      isCurrentActive={isCurrentActive}
                    />

                    {/* Stepping dots between nodes */}
                    {skillIdx < unit.skills.length - 1 && (
                      <div
                        className="flex flex-col items-center gap-2 my-3"
                        style={{
                          transform: `translateX(${Math.sin((skillIdx + 0.5) * 0.9) * 40}px)`,
                        }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Unit End Milestone Trophy / Gift Chest */}
              <div
                className="mt-6 flex flex-col items-center cursor-pointer group"
                onClick={() => {
                  playClick();
                  playFanfare();
                }}
              >
                <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-500 shadow-md group-hover:scale-105 active:scale-95 transition-transform">
                  <Gift size={32} className="animate-bounce" />
                </div>
                <span className="font-black text-xs text-amber-700 mt-2 uppercase tracking-wider">
                  Unit Milestone
                </span>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
