import React from "react";
import Image from "next/image";
import { Compass, Sparkles } from "lucide-react";

interface StepPlacementProps {
  courseName: string;
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function StepPlacement({
  courseName,
  selected,
  onSelect,
}: StepPlacementProps) {
  return (
    <div className="w-full flex flex-col items-center mt-4">
      {/* Mascot & Speech Bubble */}
      <div className="flex items-center self-start mb-8 ml-2 sm:ml-6 gap-3">
        <div className="relative w-24 h-24 shrink-0">
          <Image
            src="/notepad-duo.svg"
            alt="Duo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="relative bg-[#37464F] border-2 border-[#37464F] text-white px-5 py-3 rounded-2xl text-base sm:text-lg font-bold">
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#37464F] border-l-2 border-b-2 border-[#37464F] transform rotate-45"
            style={{ borderRadius: "2px" }}
          />
          Now let&apos;s find the best place to start!
        </div>
      </div>

      {/* Options List */}
      <div className="w-full max-w-[500px] flex flex-col gap-4">
        {/* Start from scratch */}
        <button
          onClick={() => onSelect("scratch")}
          className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left
            ${
              selected === "scratch"
                ? "border-[#38BDF8] bg-[#38BDF8]/10"
                : "border-[#37464F] bg-transparent hover:bg-[#37464F]/50"
            }
          `}
        >
          <div className="w-14 h-14 bg-[#58CC02] rounded-full flex items-center justify-center shrink-0 mr-5">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-white mb-1">
              Start from scratch
            </span>
            <span className="text-[#9ca3af] text-[15px] font-medium leading-tight">
              Take the easiest lesson of the {courseName} course
            </span>
          </div>
        </button>

        {/* Find my level */}
        <button
          onClick={() => onSelect("find_level")}
          className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left
            ${
              selected === "find_level"
                ? "border-[#38BDF8] bg-[#38BDF8]/10"
                : "border-[#37464F] bg-transparent hover:bg-[#37464F]/50"
            }
          `}
        >
          <div className="w-14 h-14 bg-[#FF4B4B] rounded-full flex items-center justify-center shrink-0 mr-5">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-white mb-1">
              Find my level
            </span>
            <span className="text-[#9ca3af] text-[15px] font-medium leading-tight">
              Let Duo recommend where you should start learning
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
