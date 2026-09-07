"use client";

import React, { useState } from "react";
import { useSound } from "@/hooks/useSound";

interface MatchPairsExerciseProps {
  prompt: string;
  pairsLeft: string[];
  pairsRight: string[];
  matchedPairs: Array<{ left: string; right: string }>;
  onMatchPairsChange: (pairs: Array<{ left: string; right: string }>) => void;
  disabled: boolean;
}

export function MatchPairsExercise({
  prompt,
  pairsLeft,
  pairsRight,
  matchedPairs,
  onMatchPairsChange,
  disabled,
}: MatchPairsExerciseProps) {
  const { playClick, playCorrect, speak } = useSound();

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const isLeftMatched = (item: string) => matchedPairs.some((p) => p.left === item);
  const isRightMatched = (item: string) => matchedPairs.some((p) => p.right === item);

  const handleLeftClick = (item: string) => {
    if (disabled || isLeftMatched(item)) return;
    playClick();
    speak(item, "es-ES");

    if (selectedRight) {
      // Form pair
      const newPair = { left: item, right: selectedRight };
      const nextPairs = [...matchedPairs, newPair];
      onMatchPairsChange(nextPairs);
      setSelectedLeft(null);
      setSelectedRight(null);
      playCorrect();
    } else {
      setSelectedLeft(item === selectedLeft ? null : item);
    }
  };

  const handleRightClick = (item: string) => {
    if (disabled || isRightMatched(item)) return;
    playClick();

    if (selectedLeft) {
      // Form pair
      const newPair = { left: selectedLeft, right: item };
      const nextPairs = [...matchedPairs, newPair];
      onMatchPairsChange(nextPairs);
      setSelectedLeft(null);
      setSelectedRight(null);
      playCorrect();
    } else {
      setSelectedRight(item === selectedRight ? null : item);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 select-none">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
        {prompt}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Spanish) */}
        <div className="space-y-3">
          {pairsLeft.map((item) => {
            const matched = isLeftMatched(item);
            const isSelected = selectedLeft === item;

            return (
              <button
                key={`left-${item}`}
                onClick={() => handleLeftClick(item)}
                disabled={disabled || matched}
                className={`w-full py-4 px-5 rounded-2xl border-2 border-b-4 font-extrabold text-base text-center transition-all ${
                  matched
                    ? "bg-slate-100 border-slate-200 text-slate-300 shadow-none cursor-default"
                    : isSelected
                    ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] scale-[1.02]"
                    : "bg-white border-slate-200 border-b-slate-300 hover:bg-slate-50 text-slate-700 active:translate-y-0.5"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Right Column (English) */}
        <div className="space-y-3">
          {pairsRight.map((item) => {
            const matched = isRightMatched(item);
            const isSelected = selectedRight === item;

            return (
              <button
                key={`right-${item}`}
                onClick={() => handleRightClick(item)}
                disabled={disabled || matched}
                className={`w-full py-4 px-5 rounded-2xl border-2 border-b-4 font-extrabold text-base text-center transition-all ${
                  matched
                    ? "bg-slate-100 border-slate-200 text-slate-300 shadow-none cursor-default"
                    : isSelected
                    ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] scale-[1.02]"
                    : "bg-white border-slate-200 border-b-slate-300 hover:bg-slate-50 text-slate-700 active:translate-y-0.5"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
