"use client";

import React, { useEffect } from "react";
import { Volume2, User, Smile } from "lucide-react";
import { SelectOption } from "@/types";
import { useSound } from "@/hooks/useSound";

interface MultipleChoiceExerciseProps {
  prompt: string;
  options: SelectOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}

export function MultipleChoiceExercise({
  prompt,
  options,
  selectedOptionId,
  onSelect,
  disabled,
}: MultipleChoiceExerciseProps) {
  const { playClick, speak } = useSound();

  // Keyboard hotkeys: '1', '2', '3'
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        e.preventDefault();
        playClick();
        onSelect(options[num - 1].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, disabled, onSelect, playClick]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 select-none">
      {/* Prompt Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          {prompt}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => {
                if (!disabled) {
                  playClick();
                  onSelect(option.id);
                  speak(option.text, "es-ES");
                }
              }}
              disabled={disabled}
              className={`relative rounded-3xl p-5 border-2 border-b-4 flex flex-col items-center justify-between text-center transition-all duration-150 min-h-[170px] ${
                isSelected
                  ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] shadow-sm"
                  : "bg-white border-slate-200 border-b-slate-300 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {/* Keyboard Shortcut Number Badge */}
              <span
                className={`absolute top-3 left-3 w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center border ${
                  isSelected
                    ? "bg-[#84d8ff] text-white border-[#53b4e6]"
                    : "bg-slate-100 text-slate-400 border-slate-200"
                }`}
              >
                {idx + 1}
              </span>

              {/* Visual Icon Illustration */}
              <div className="my-auto pt-4 flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform ${
                    isSelected ? "scale-110" : ""
                  } ${
                    option.image === "boy"
                      ? "bg-sky-100 text-sky-500"
                      : option.image === "girl"
                      ? "bg-rose-100 text-rose-500"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <Smile size={36} />
                </div>

                <span className="font-black text-lg text-slate-800 leading-snug">
                  {option.text}
                </span>

                {option.translation && (
                  <span className="text-xs font-bold text-slate-400 mt-0.5">
                    {option.translation}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
