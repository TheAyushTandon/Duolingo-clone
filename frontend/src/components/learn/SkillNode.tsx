"use client";

import React from "react";
import Link from "next/link";
import { Check, Crown, Play, X } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { RoadmapChest } from "./RoadmapChest";

export type RoadmapNodeType = "star" | "chest" | "headphones" | "trophy";
export type RoadmapNodeState = "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";

export interface RoadmapNodeItem {
  id: string;
  title: string;
  description: string;
  type: RoadmapNodeType;
  state: RoadmapNodeState;
  progress_percentage: number;
  level?: number;
  total_levels?: number;
  lessons?: Array<{ id: string; title: string; xp_reward?: number }>;
  next_lesson_id?: string;
  offsetX: number;
}

interface SkillNodeProps {
  node: RoadmapNodeItem;
  index: number;
  isCurrentActive?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function SkillNode({
  node,
  index,
  isCurrentActive = false,
  isOpen,
  onToggle,
  onClose,
}: SkillNodeProps) {
  const { playClick } = useSound();

  const isCompleted = node.state === "COMPLETED";
  const isLocked = node.state === "LOCKED";
  const isAvailable = node.state === "AVAILABLE" || node.state === "IN_PROGRESS";

  // The lesson to start next (prefer the precise next uncompleted lesson)
  const activeLesson =
    node.lessons?.find((l) => l.id === node.next_lesson_id) ||
    node.lessons?.[0] || {
      id: node.next_lesson_id || node.id,
      title: node.title,
      xp_reward: 10,
    };

  const handleNodeClick = () => {
    playClick();
    onToggle();
  };

  return (
    <div
      className={`relative flex flex-col items-center my-4 select-none ${
        isOpen ? "z-50" : isCurrentActive ? "z-20" : "z-10"
      }`}
      style={{ transform: `translateX(${node.offsetX}px)` }}
    >
      {/* Floating START Speech Bubble for Current Active Node */}
      {isCurrentActive && !isOpen && (
        <div
          className="absolute -top-12 z-30 cursor-pointer animate-bounce"
          onClick={handleNodeClick}
        >
          <div className="relative bg-[#131F24] border-[2.5px] border-[#2B353B] px-4 py-1.5 rounded-2xl shadow-xl font-din font-black text-xs text-[#58CC02] tracking-wider uppercase flex items-center justify-center">
            <span>START</span>
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-[#2B353B]" />
          </div>
        </div>
      )}

      {/* Completed Crown Badge */}
      {isCompleted && (
        <div className="absolute -top-2.5 right-0 z-30 w-7 h-7 rounded-full bg-[#FFC800] border-2 border-white shadow-md flex items-center justify-center text-white">
          <Crown size={14} className="fill-white" />
        </div>
      )}

      {/* Node Render: Chest vs Circular 3D Disc */}
      {node.type === "chest" ? (
        <div className="relative py-1">
          <RoadmapChest onClick={handleNodeClick} isUnlocked={isCompleted} />
        </div>
      ) : isCurrentActive ? (
        /* Active 3D Green Button */
        <button
          onClick={handleNodeClick}
          aria-label={node.title}
          className="w-20 h-20 rounded-full bg-[#58CC02] border-none flex items-center justify-center cursor-pointer transition-all duration-100 hover:brightness-105 active:translate-y-1 z-20"
          style={{
            boxShadow: "0 8px 0 #46A302, 0 10px 18px rgba(0,0,0,0.35)",
          }}
        >
          {/* Solid White Star */}
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#FFFFFF">
            <path
              d="M12 2.5 L14.9 8.6 L21.6 9.4 C22.2 9.5 22.4 10.3 22 10.7 L17 15.3 L18.4 21.8 C18.5 22.4 17.9 22.9 17.3 22.6 L12 19.4 L6.7 22.6 C6.1 22.9 5.5 22.4 5.6 21.8 L7 15.3 L2 10.7 C1.6 10.3 1.8 9.5 2.4 9.4 L9.1 8.6 L12 2.5 Z"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        /* Regular / Completed / Locked 3D Disc Button */
        <button
          onClick={handleNodeClick}
          aria-label={node.title}
          className={`w-20 h-20 rounded-full flex items-center justify-center border-none transition-all duration-100 ${
            isCompleted
              ? "bg-[#FFC800] cursor-pointer hover:brightness-105 active:translate-y-1"
              : isAvailable
              ? "bg-[#58CC02] cursor-pointer hover:brightness-105 active:translate-y-1"
              : "bg-[#35454F] cursor-pointer hover:brightness-110 active:translate-y-1"
          }`}
          style={{
            boxShadow: isCompleted
              ? "0 8px 0 #D19500, 0 10px 18px rgba(0,0,0,0.35)"
              : isAvailable
              ? "0 8px 0 #46A302, 0 10px 18px rgba(0,0,0,0.35)"
              : "0 8px 0 #243038",
          }}
        >
          {isCompleted ? (
            <Check size={36} strokeWidth={4} className="text-white" />
          ) : node.type === "headphones" ? (
            /* Embossed Headphones matching Duolingo reference */
            <svg width="42" height="42" viewBox="0 0 28 28" fill="none">
              <path
                d="M5.5 15.5 A8.5 8.5 0 0 1 22.5 15.5"
                stroke={isAvailable ? "#FFFFFF" : "#506673"}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <rect
                x="3.5"
                y="14"
                width="5"
                height="9.5"
                rx="2.5"
                fill={isAvailable ? "#FFFFFF" : "#506673"}
              />
              <rect
                x="4.8"
                y="16"
                width="2.2"
                height="5"
                rx="1.1"
                fill={isAvailable ? "#A3E635" : "#657B8A"}
              />
              <rect
                x="19.5"
                y="14"
                width="5"
                height="9.5"
                rx="2.5"
                fill={isAvailable ? "#FFFFFF" : "#506673"}
              />
              <rect
                x="21"
                y="16"
                width="2.2"
                height="5"
                rx="1.1"
                fill={isAvailable ? "#A3E635" : "#657B8A"}
              />
            </svg>
          ) : node.type === "trophy" ? (
            /* Embossed Owl-Eared Trophy Cup matching Duolingo reference */
            <svg width="44" height="44" viewBox="0 0 28 28" fill={isAvailable ? "#FFFFFF" : "#506673"}>
              <path d="M7 6 C8.5 4.5 11 5 14 6 C17 5 19.5 4.5 21 6 C21.5 10 20.5 14.5 15.5 17.2 L15.5 19 L17.5 19.5 C18 19.6 18.5 20.2 18.5 21 L18.5 22 L9.5 22 L9.5 21 C9.5 20.2 10 19.6 10.5 19.5 L12.5 19 L12.5 17.2 C7.5 14.5 6.5 10 7 6 Z" />
              <path d="M5.5 10 C4.2 9.5 3 10.5 3.5 12 C4.5 12.5 5.5 12 5.5 11 Z" />
              <path d="M5.5 13 C3.8 13.2 3.2 15 4.5 16 C5.5 16 6 15 5.5 13.8 Z" />
              <path d="M6 16.5 C4.8 17.5 5.2 19 6.8 19 C7.8 18.2 7.5 17 6.5 16.5 Z" />
              <path d="M22.5 10 C23.8 9.5 25 10.5 24.5 12 C23.5 12.5 22.5 12 22.5 11 Z" />
              <path d="M22.5 13 C24.2 13.2 24.8 15 23.5 16 C22.5 16 22 15 22.5 13.8 Z" />
              <path d="M22 16.5 C23.2 17.5 22.8 19 21.2 19 C20.2 18.2 20.5 17 21.5 16.5 Z" />
            </svg>
          ) : (
            /* Embossed Rounded 5-Point Star */
            <svg width="38" height="38" viewBox="0 0 24 24" fill={isAvailable ? "#FFFFFF" : "#506673"}>
              <path
                d="M12 2.5 L14.9 8.6 L21.6 9.4 C22.2 9.5 22.4 10.3 22 10.7 L17 15.3 L18.4 21.8 C18.5 22.4 17.9 22.9 17.3 22.6 L12 19.4 L6.7 22.6 C6.1 22.9 5.5 22.4 5.6 21.8 L7 15.3 L2 10.7 C1.6 10.3 1.8 9.5 2.4 9.4 L9.1 8.6 L12 2.5 Z"
                stroke={isAvailable ? "#FFFFFF" : "#506673"}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}

      {/* Duolingo Card Popover on Click with Backdrop */}
      {isOpen && (
        <>
          {/* Invisible Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />

          <div
            className="absolute top-24 z-50 w-72 bg-[#182329] rounded-3xl border-2 border-[#2B353B] p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-din font-black text-[11px] uppercase tracking-wider text-[var(--text-sub)] block">
                  {isCompleted
                    ? "Completed"
                    : isLocked
                    ? "Locked"
                    : `Level ${node.level || 1} of ${node.total_levels || 1}`}
                </span>
                <h4 className="font-din font-black text-base text-[var(--text-main)] leading-tight">
                  {node.title}
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-[var(--text-sub)] hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs font-bold text-[var(--text-sub)] mb-4">
              {node.description}
            </p>

            {isLocked ? (
              <div className="w-full py-3 rounded-2xl bg-[#2E383F] text-[var(--text-sub)] font-din font-black text-xs uppercase tracking-wider text-center border-2 border-[#1D252A]">
                Complete previous lessons to unlock
              </div>
            ) : node.type === "chest" ? (
              <div className="w-full py-3 rounded-2xl bg-[#FFC800] text-white font-din font-black text-xs uppercase tracking-wider text-center shadow-[0_4px_0_#D19500]">
                Checkpoint Reached! (+20 Gems)
              </div>
            ) : node.type === "trophy" ? (
              <div className="w-full py-3 rounded-2xl bg-[#FFC800] text-white font-din font-black text-xs uppercase tracking-wider text-center shadow-[0_4px_0_#D19500]">
                Unit Mastered! 🏆
              </div>
            ) : (
              <Link
                href={`/lesson/${activeLesson.id}`}
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className={`w-full py-3 rounded-2xl font-din font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCompleted
                    ? "bg-[#FFC800] text-white hover:bg-[#E5A400] shadow-[0_4px_0_#D19500] active:translate-y-0.5 active:shadow-none"
                    : "bg-[#58CC02] text-white hover:bg-[#46A302] shadow-[0_4px_0_#46A302] active:translate-y-0.5 active:shadow-none"
                }`}
              >
                <Play size={16} className="fill-current" />
                <span>{isCompleted ? "PRACTICE +10 XP" : `START +${activeLesson.xp_reward || 10} XP`}</span>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
