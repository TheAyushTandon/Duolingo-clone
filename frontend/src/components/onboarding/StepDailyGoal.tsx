import React from "react";
import Image from "next/image";

interface StepDailyGoalProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

const OPTIONS = [
  { id: "5", label: "Casual", min: "5 min / day" },
  { id: "10", label: "Regular", min: "10 min / day" },
  { id: "15", label: "Serious", min: "15 min / day" },
  { id: "20", label: "Intense", min: "20 min / day" },
];

const optionWordsMap: Record<string, number> = {
  "5": 25,
  "10": 50,
  "15": 75,
  "20": 100,
};

export default function StepDailyGoal({
  selected,
  onSelect,
}: StepDailyGoalProps) {
  const words = selected ? optionWordsMap[selected] : 75;

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
          That&apos;s <span className="text-[#CE82FF]">{words} words</span> in your first week!
        </div>
      </div>

      {/* Options List */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-colors
                ${
                  isSelected
                    ? "border-[#38BDF8] bg-[#38BDF8]/10 text-[#38BDF8]"
                    : "border-[#37464F] bg-transparent hover:bg-[#37464F]/50 text-white"
                }
              `}
            >
              <span className="font-bold text-[17px]">{option.label}</span>
              <span className={`font-bold text-[15px] ${isSelected ? "text-[#38BDF8]" : "text-[#52656D]"}`}>
                {option.min}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
