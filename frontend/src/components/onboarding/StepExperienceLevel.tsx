import React from "react";
import Image from "next/image";
import { BarChart2 } from "lucide-react";

interface StepExperienceLevelProps {
  courseName: string;
  selected: string | null;
  onSelect: (id: string) => void;
}

const OPTIONS = [
  { id: "new", label: "I'm new to {course}" },
  { id: "common_words", label: "I know some common words" },
  { id: "basic_convos", label: "I can have basic conversations" },
  { id: "various_topics", label: "I can talk about various topics" },
  { id: "detail", label: "I can discuss most topics in detail" },
];

export default function StepExperienceLevel({
  courseName,
  selected,
  onSelect,
}: StepExperienceLevelProps) {
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
          Okay, we&apos;ll start fresh!
        </div>
      </div>

      {/* Options List */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          const label = option.label.replace("{course}", courseName);

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors
                ${
                  isSelected
                    ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                    : "border-[#37464F] bg-transparent hover:bg-[#37464F]/50 text-white"
                }
              `}
            >
              <BarChart2
                className={`w-6 h-6 mr-4 shrink-0 ${
                  isSelected ? "text-[#38BDF8]" : "text-[#52656D]"
                }`}
              />
              <span className="font-bold text-[17px] text-left">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
