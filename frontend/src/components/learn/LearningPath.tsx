"use client";

import React, { useState, useEffect } from "react";
import { UnitBanner } from "./UnitBanner";
import { SkillNode, RoadmapNodeItem } from "./SkillNode";
import { RoadmapMascot } from "./RoadmapMascot";
import { UnitPathItem } from "@/types";

interface LearningPathProps {
  units: UnitPathItem[];
}

// Duolingo serpentine offset sequence (pixels horizontally relative to center)
const SERPENTINE_OFFSETS = [0, -42, -72, -42, 0, 42, 0];

// Unit banner colors palette
const BANNER_COLORS = [
  "bg-[#58cc02]", // Emerald Green
  "bg-[#1cb0f6]", // Sky Blue
  "bg-[#ce82ff]", // Lilac Purple
  "bg-[#ff9600]", // Sunset Orange
  "bg-[#ff4b4b]", // Rose Red
];

export function LearningPath({ units }: LearningPathProps) {
  // Only ONE popover open across the entire roadmap at any time
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Close popover when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPopoverId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Find the single active skill in the course: the FIRST skill that is AVAILABLE or IN_PROGRESS
  let activeSkillId: string | null = null;
  for (const unit of units) {
    for (const skill of unit.skills) {
      if (skill.state === "AVAILABLE" || skill.state === "IN_PROGRESS") {
        activeSkillId = skill.id;
        break;
      }
    }
    if (activeSkillId) break;
  }

  // Fallback: if everything is locked, make the very first incomplete skill active
  if (!activeSkillId && units.length > 0 && units[0].skills.length > 0) {
    const firstIncomplete = units[0].skills.find((s) => s.state !== "COMPLETED");
    if (firstIncomplete) {
      activeSkillId = firstIncomplete.id;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 select-none pb-28 font-din">
      {units.map((unit, unitIdx) => {
        const bannerColor = BANNER_COLORS[unitIdx % BANNER_COLORS.length];
        const isUnitCompleted =
          unit.skills.length > 0 &&
          unit.skills.every((s) => s.state === "COMPLETED");

        const roadmapNodes: RoadmapNodeItem[] = [];
        const skills = unit.skills || [];

        // First batch of skills (up to 3)
        const firstBatch = skills.slice(0, 3);
        firstBatch.forEach((skill) => {
          const isListening =
            skill.icon === "headphones" ||
            skill.title.toLowerCase().includes("listening") ||
            skill.title.toLowerCase().includes("audio") ||
            skill.title.toLowerCase().includes("écoute");

          roadmapNodes.push({
            id: skill.id,
            title: skill.title,
            description: skill.description || "Practice and learn words",
            type: isListening ? "headphones" : "star",
            state: skill.state,
            progress_percentage: skill.progress_percentage || 0,
            level: skill.level || 1,
            total_levels: skill.total_levels || 5,
            lessons: skill.lessons || [],
            next_lesson_id: skill.next_lesson_id || skill.lessons?.[0]?.id,
            offsetX: 0,
          });
        });

        // Checkpoint Chest (unlocked when the first 3 skills are COMPLETED)
        const isChestUnlocked =
          firstBatch.length > 0 && firstBatch.every((s) => s.state === "COMPLETED");
        roadmapNodes.push({
          id: `unit-${unitIdx}-chest`,
          title: "Checkpoint Chest",
          description: isChestUnlocked
            ? "Checkpoint claimed! Bonus 20 Gems added."
            : "Complete the first 3 skills to claim bonus Gems!",
          type: "chest",
          state: isChestUnlocked ? "COMPLETED" : "LOCKED",
          progress_percentage: isChestUnlocked ? 100 : 0,
          offsetX: 0,
        });

        // Second batch of skills (skills 3 and beyond, e.g. Listening Lab & Grammar Sprint)
        const secondBatch = skills.slice(3);
        secondBatch.forEach((skill) => {
          const isListening =
            skill.icon === "headphones" ||
            skill.title.toLowerCase().includes("listening") ||
            skill.title.toLowerCase().includes("audio") ||
            skill.title.toLowerCase().includes("écoute");

          roadmapNodes.push({
            id: skill.id,
            title: skill.title,
            description: skill.description || "Practice and learn words",
            type: isListening ? "headphones" : "star",
            state: skill.state,
            progress_percentage: skill.progress_percentage || 0,
            level: skill.level || 1,
            total_levels: skill.total_levels || 5,
            lessons: skill.lessons || [],
            next_lesson_id: skill.next_lesson_id || skill.lessons?.[0]?.id,
            offsetX: 0,
          });
        });

        // Append Unit Mastery Trophy (unlocked when all skills in unit are COMPLETED)
        roadmapNodes.push({
          id: `unit-${unitIdx}-trophy`,
          title: `Unit ${unitIdx + 1} Mastery`,
          description: isUnitCompleted
            ? `Congratulations! You mastered Unit ${unitIdx + 1}!`
            : `Pass all lessons to earn your Unit ${unitIdx + 1} Trophy!`,
          type: "trophy",
          state: isUnitCompleted ? "COMPLETED" : "LOCKED",
          progress_percentage: isUnitCompleted ? 100 : 0,
          level: 1,
          total_levels: 1,
          offsetX: 0,
        });

        // Assign serpentine S-curve offsets to all 7 nodes
        roadmapNodes.forEach((node, idx) => {
          node.offsetX = SERPENTINE_OFFSETS[idx % SERPENTINE_OFFSETS.length];
        });

        return (
          <section key={unit.id} className="mb-20">
            {/* Unit Header Banner */}
            <UnitBanner
              unitIndex={unitIdx}
              title={unit.title}
              description={unit.description}
              bannerColor={bannerColor}
            />

            {/* Serpentine Roadmap Path */}
            <div className="flex flex-col items-center relative py-6">
              {roadmapNodes.map((node, nodeIdx) => {
                const isCurrentActive = node.id === activeSkillId;

                return (
                  <div
                    key={node.id}
                    className="relative w-full flex justify-center items-center"
                  >
                    <SkillNode
                      node={node}
                      index={nodeIdx}
                      isCurrentActive={isCurrentActive}
                      isOpen={openPopoverId === node.id}
                      onToggle={() =>
                        setOpenPopoverId((prev) =>
                          prev === node.id ? null : node.id
                        )
                      }
                      onClose={() => setOpenPopoverId(null)}
                    />

                    {/* Duo Mascot standing beside the active node */}
                    {isCurrentActive && (
                      <div
                        className="absolute z-20 transition-all duration-300 pointer-events-none select-none"
                        style={{
                          left:
                            node.offsetX <= 0
                              ? "calc(50% + 52px)"
                              : "calc(50% - 150px)",
                          top: "-10px",
                        }}
                      >
                        <RoadmapMascot />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
