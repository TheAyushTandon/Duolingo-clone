"use client";

import { Check, Crown, Headphones, Lock, Star, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "react-circular-progressbar/dist/styles.css";

export type LessonType = "star" | "chest" | "headphones" | "trophy" | "crown";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  type?: LessonType;
  showMascot?: boolean;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  type = "star",
  showMascot = false,
}: LessonButtonProps) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = -(cycleIndex - 4);
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 45;

  const isFirst = index === 0;
  const isCompleted = !current && !locked;

  const getIcon = () => {
    if (isCompleted) return Check;
    if (type === "chest") return null; // Render custom chest icon
    if (type === "headphones") return Headphones;
    if (type === "trophy") return Trophy;
    if (type === "crown") return Crown;
    return Star;
  };

  const Icon = getIcon();
  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  return (
    <div className="relative">
      <Link
        href={href}
        prefetch
        aria-disabled={locked}
        style={{ pointerEvents: locked ? "none" : "auto" }}
      >
        <div
          className="relative"
          style={{
            right: `${rightPosition}px`,
            marginTop: isFirst && !isCompleted ? 60 : 28,
          }}
        >
          {current ? (
            <div className="relative h-[102px] w-[102px]">
              <div className="absolute -top-6 left-2.5 z-10 animate-bounce rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] px-3 py-2.5 font-bold uppercase tracking-wide text-green-500 shadow-md">
                Start
                <div
                  className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent border-t-[var(--border-color)]"
                  aria-hidden
                />
              </div>
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: {
                    stroke: "#4ade80",
                  },
                  trail: {
                    stroke: "var(--border-color)",
                  },
                }}
              >
                <Button
                  size="rounded"
                  variant={locked ? "locked" : "secondary"}
                  className="h-[70px] w-[70px] border-b-8 shadow-md"
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "h-9 w-9",
                        locked
                          ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                          : "fill-primary-foreground text-primary-foreground",
                        isCompleted && "fill-none stroke-[4]"
                      )}
                    />
                  ) : (
                    <span className="text-2xl">🎁</span>
                  )}
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <Button
              size="rounded"
              variant={locked ? "locked" : "secondary"}
              className="h-[70px] w-[70px] border-b-8 shadow-md"
            >
              {Icon ? (
                <Icon
                  className={cn(
                    "h-9 w-9",
                    locked
                      ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                      : "fill-primary-foreground text-primary-foreground",
                    isCompleted && "fill-none stroke-[4]"
                  )}
                />
              ) : (
                <span className="text-2xl">🎁</span>
              )}
            </Button>
          )}
        </div>
      </Link>

      {/* Duo Mascot standing alongside the path */}
      {showMascot && (
        <div
          className="absolute top-[-10px] right-[-150px] pointer-events-none select-none animate-gentle-bounce"
        >
          <div className="relative w-36 h-36">
            <Image
              src="/footer-duo.svg"
              alt="Duo"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
