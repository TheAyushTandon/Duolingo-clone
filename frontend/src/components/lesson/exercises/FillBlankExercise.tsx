"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";

interface FillBlankExerciseProps {
  prompt: string;
  sentenceParts: string[];
  choices: string[];
  selectedChoice: string | null;
  onSelectChoice: (choice: string) => void;
  disabled: boolean;
  locale?: string;
}

export function FillBlankExercise({
  prompt,
  sentenceParts,
  choices,
  selectedChoice,
  onSelectChoice,
  disabled,
  locale = "es-ES",
}: FillBlankExerciseProps) {
  const { playClick, speak } = useSound();
  const { tp } = useTranslation();

  const part1 = sentenceParts[0] || "";
  const part2 = sentenceParts[1] || "";

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 select-none">
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
        {tp(prompt)}
      </h2>

      {/* Sentence with Blank Slot */}
      <div className="flex items-center justify-center gap-2 p-6 rounded-3xl bg-[var(--bg-sidebar)] border-2 border-[var(--border-color)] text-xl sm:text-2xl font-black text-[var(--text-main)]">
        <span>{part1}</span>

        <span
          className={`min-w-[100px] h-12 px-4 rounded-2xl flex items-center justify-center border-2 transition-all ${
            selectedChoice
              ? "bg-[#ddf4ff] border-[#84d8ff] text-[#1cb0f6] dark:bg-[#1a384c] dark:border-[#1cb0f6]"
              : "border-dashed border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-sub)]/50"
          }`}
        >
          {selectedChoice || "______"}
        </span>

        <span>{part2}</span>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice;

          return (
            <button
              key={choice}
              onClick={() => {
                if (!disabled) {
                  playClick();
                  onSelectChoice(choice);
                  speak(choice, locale);
                }
              }}
              disabled={disabled}
              className={`py-4 px-6 rounded-2xl border-2 border-b-4 font-black text-lg text-center transition-all ${
                isSelected
                  ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] scale-[1.02] dark:bg-[#1a384c] dark:border-[#1cb0f6]"
                  : "bg-[var(--bg-sidebar)] border-[var(--border-color)] hover:bg-[var(--border-color)]/20 text-[var(--text-main)] active:translate-y-0.5"
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
