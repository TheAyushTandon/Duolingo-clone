"use client";

import React, { useState } from "react";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";

interface MatchPairsExerciseProps {
  prompt: string;
  pairsLeft: string[];
  pairsRight: string[];
  matchedPairs: Array<{ left: string; right: string }>;
  onMatchPairsChange: (pairs: Array<{ left: string; right: string }>) => void;
  disabled: boolean;
  locale?: string;
  pairsMap?: Record<string, string>;
}

export function MatchPairsExercise({
  prompt,
  pairsLeft,
  pairsRight,
  matchedPairs,
  onMatchPairsChange,
  disabled,
  locale = "es-ES",
  pairsMap,
}: MatchPairsExerciseProps) {
  const { playClick, playCorrect, playIncorrect, speak } = useSound();
  const { tp } = useTranslation();

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [mismatchedLeft, setMismatchedLeft] = useState<string | null>(null);
  const [mismatchedRight, setMismatchedRight] = useState<string | null>(null);

  const isLeftMatched = (item: string) => matchedPairs.some((p) => p.left === item);
  const isRightMatched = (item: string) => matchedPairs.some((p) => p.right === item);

  const checkPairMatch = (left: string, right: string) => {
    if (!pairsMap) return true;
    return pairsMap[left] === right || pairsMap[right] === left;
  };

  const handleLeftClick = (item: string) => {
    if (disabled || isLeftMatched(item) || mismatchedLeft || mismatchedRight) return;
    playClick();
    speak(item, locale);

    if (selectedRight) {
      if (checkPairMatch(item, selectedRight)) {
        // Correct pair matched
        const newPair = { left: item, right: selectedRight };
        const nextPairs = [...matchedPairs, newPair];
        onMatchPairsChange(nextPairs);
        setSelectedLeft(null);
        setSelectedRight(null);
        playCorrect();
      } else {
        // Mismatch: flash red for a split second
        playIncorrect();
        setMismatchedLeft(item);
        setMismatchedRight(selectedRight);
        setTimeout(() => {
          setMismatchedLeft(null);
          setMismatchedRight(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 550);
      }
    } else {
      setSelectedLeft(item === selectedLeft ? null : item);
    }
  };

  const handleRightClick = (item: string) => {
    if (disabled || isRightMatched(item) || mismatchedLeft || mismatchedRight) return;
    playClick();

    if (selectedLeft) {
      if (checkPairMatch(selectedLeft, item)) {
        // Correct pair matched
        const newPair = { left: selectedLeft, right: item };
        const nextPairs = [...matchedPairs, newPair];
        onMatchPairsChange(nextPairs);
        setSelectedLeft(null);
        setSelectedRight(null);
        playCorrect();
      } else {
        // Mismatch: flash red for a split second
        playIncorrect();
        setMismatchedLeft(selectedLeft);
        setMismatchedRight(item);
        setTimeout(() => {
          setMismatchedLeft(null);
          setMismatchedRight(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 550);
      }
    } else {
      setSelectedRight(item === selectedRight ? null : item);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 select-none">
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
        {tp(prompt)}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (Spanish) */}
        <div className="space-y-3">
          {pairsLeft.map((item) => {
            const matched = isLeftMatched(item);
            const isSelected = selectedLeft === item;
            const isMismatched = mismatchedLeft === item;

            return (
              <button
                key={`left-${item}`}
                onClick={() => handleLeftClick(item)}
                disabled={disabled || matched}
                className={`w-full py-4 px-5 rounded-2xl border-2 border-b-4 font-extrabold text-base text-center transition-all ${
                  matched
                    ? "bg-[var(--border-color)]/30 border-[var(--border-color)] text-[var(--text-sub)]/40 shadow-none cursor-default opacity-50"
                    : isMismatched
                    ? "bg-[#ffdfdf] border-[#ff4b4b] border-b-[#ea2b2b] text-[#ff4b4b] animate-shake dark:bg-[#ff4b4b]/20 dark:border-[#ff4b4b]"
                    : isSelected
                    ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] scale-[1.02] dark:bg-[#1a384c] dark:border-[#1cb0f6]"
                    : "bg-[var(--bg-sidebar)] border-[var(--border-color)] hover:bg-[var(--border-color)]/20 text-[var(--text-main)] active:translate-y-0.5"
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
            const isMismatched = mismatchedRight === item;

            return (
              <button
                key={`right-${item}`}
                onClick={() => handleRightClick(item)}
                disabled={disabled || matched}
                className={`w-full py-4 px-5 rounded-2xl border-2 border-b-4 font-extrabold text-base text-center transition-all ${
                  matched
                    ? "bg-[var(--border-color)]/30 border-[var(--border-color)] text-[var(--text-sub)]/40 shadow-none cursor-default opacity-50"
                    : isMismatched
                    ? "bg-[#ffdfdf] border-[#ff4b4b] border-b-[#ea2b2b] text-[#ff4b4b] animate-shake dark:bg-[#ff4b4b]/20 dark:border-[#ff4b4b]"
                    : isSelected
                    ? "bg-[#ddf4ff] border-[#84d8ff] border-b-[#53b4e6] text-[#1cb0f6] scale-[1.02] dark:bg-[#1a384c] dark:border-[#1cb0f6]"
                    : "bg-[var(--bg-sidebar)] border-[var(--border-color)] hover:bg-[var(--border-color)]/20 text-[var(--text-main)] active:translate-y-0.5"
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
