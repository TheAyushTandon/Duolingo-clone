"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { DuoMascot } from "@/components/mascot/DuoMascot";

interface WordBankExerciseProps {
  prompt: string;
  sentence?: string;
  wordBank: string[];
  selectedIndices: number[];
  onToggleIndex: (index: number) => void;
  disabled: boolean;
}

export function WordBankExercise({
  prompt,
  sentence,
  wordBank,
  selectedIndices,
  onToggleIndex,
  disabled,
}: WordBankExerciseProps) {
  const { playClick, speak } = useSound();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 select-none">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
        {prompt}
      </h2>

      {/* Mascot Speaking Sentence */}
      {sentence && (
        <div className="flex items-start gap-4 py-2">
          {/* Small Mascot */}
          <div className="w-20 h-20 shrink-0">
            <DuoMascot mood="happy" className="w-full h-full" />
          </div>

          {/* Speech Bubble */}
          <div className="relative bg-white border-2 border-slate-200 rounded-3xl px-5 py-3 shadow-sm flex items-center gap-3">
            {/* Arrow pointer */}
            <div className="absolute top-6 -left-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-slate-200" />
            <div className="absolute top-6 -left-2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[9px] border-r-white" />

            <button
              onClick={() => {
                playClick();
                speak(sentence, "es-ES");
              }}
              className="p-2.5 rounded-2xl bg-[#1cb0f6] text-white hover:bg-[#1899d6] active:scale-95 transition-all shadow-[0_2px_0_#1482b6]"
              title="Listen to sentence"
            >
              <Volume2 size={20} />
            </button>

            <span className="font-extrabold text-lg text-slate-800">
              {sentence}
            </span>
          </div>
        </div>
      )}

      {/* Selected Tokens Answer Tray */}
      <div className="min-h-[72px] border-b-2 border-slate-200 py-3 flex flex-wrap items-center gap-2">
        {selectedIndices.map((idx) => {
          const word = wordBank[idx];
          return (
            <button
              key={`selected-${idx}`}
              onClick={() => {
                if (!disabled) {
                  playClick();
                  onToggleIndex(idx);
                }
              }}
              disabled={disabled}
              className="px-4 py-2.5 rounded-2xl bg-white border-2 border-b-4 border-slate-200 hover:border-slate-300 font-extrabold text-base text-slate-800 shadow-sm active:translate-y-0.5 transition-all"
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Word Bank Pool */}
      <div className="pt-4 flex flex-wrap justify-center gap-2.5">
        {wordBank.map((word, idx) => {
          const isSelected = selectedIndices.includes(idx);

          return (
            <div key={`pool-slot-${idx}`} className="relative">
              {/* Background hollow slot when word is selected */}
              <div
                className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100 font-extrabold text-base px-4 py-2.5 invisible`}
              >
                {word}
              </div>

              {/* Foreground interactive token */}
              {!isSelected ? (
                <button
                  onClick={() => {
                    if (!disabled) {
                      playClick();
                      onToggleIndex(idx);
                    }
                  }}
                  disabled={disabled}
                  className="absolute inset-0 px-4 py-2.5 rounded-2xl bg-white border-2 border-b-4 border-slate-200 hover:border-slate-300 active:border-b-2 font-extrabold text-base text-slate-800 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  {word}
                </button>
              ) : (
                <div className="absolute inset-0 rounded-2xl bg-slate-200/70 border-2 border-slate-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
