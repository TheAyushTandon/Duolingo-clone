"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { getQuestionSvg } from "@/lib/question-assets";
import { useTranslation } from "@/stores/useLanguageStore";

interface WordBankExerciseProps {
  prompt: string;
  sentence?: string;
  wordBank: string[];
  selectedIndices: number[];
  onToggleIndex: (index: number) => void;
  disabled: boolean;
  locale?: string;
  isSpeechOnly?: boolean;
}

export function WordBankExercise({
  prompt,
  sentence,
  wordBank,
  selectedIndices,
  onToggleIndex,
  disabled,
  locale = "es-ES",
  isSpeechOnly = false,
}: WordBankExerciseProps) {
  const { playClick, speak } = useSound();
  const { tp } = useTranslation();
  const avatarSvg = React.useMemo(() => getQuestionSvg(prompt + (sentence || "")), [prompt, sentence]);

  // Auto-play speech on mount when in speech-only listening mode
  React.useEffect(() => {
    if (isSpeechOnly && sentence) {
      const timer = setTimeout(() => {
        speak(sentence, locale, 0.9);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSpeechOnly, sentence, locale, speak]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 select-none">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
        {isSpeechOnly ? tp("Tap what you hear") : tp(prompt)}
      </h2>

      {/* Mascot Speaking Sentence or Speech-Only Audio Player */}
      {sentence && (
        <div className="flex items-center gap-4 py-2">
          {/* Question SVG Speaker Mascot */}
          <div className="w-24 h-24 shrink-0 flex items-center justify-center">
            <img
              src={avatarSvg}
              alt="Speaker"
              className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-200"
            />
          </div>

          {/* Speech Bubble / Audio Player */}
          <div className="relative bg-[var(--bg-sidebar)] border-2 border-[var(--border-color)] rounded-3xl px-5 py-4 shadow-sm flex items-center gap-4">
            {/* Arrow pointer */}
            <div className="absolute top-7 -left-2.5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-[var(--border-color)]" />
            <div className="absolute top-7 -left-2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[9px] border-r-[var(--bg-sidebar)]" />

            {/* Normal Speed Speaker Button */}
            <button
              onClick={() => {
                playClick();
                speak(sentence, locale, 0.9);
              }}
              className="w-14 h-14 rounded-2xl bg-[#1cb0f6] text-white hover:bg-[#1899d6] active:scale-95 transition-all shadow-[0_4px_0_#1482b6] flex items-center justify-center cursor-pointer shrink-0"
              title="Listen (Normal speed)"
            >
              <Volume2 size={28} />
            </button>

            {/* Slow Turtle Speed Button */}
            <button
              onClick={() => {
                playClick();
                speak(sentence, locale, 0.6);
              }}
              className="w-11 h-11 rounded-2xl bg-[#ff9600] text-white hover:bg-[#e08500] active:scale-95 transition-all shadow-[0_3px_0_#b86d00] flex items-center justify-center cursor-pointer shrink-0 text-xl font-black"
              title="Listen slowly (Turtle speed)"
            >
              🐢
            </button>

            {/* In speech-only mode: text is completely hidden! Otherwise, show sentence */}
            {isSpeechOnly ? (
              <div className="flex flex-col">
                <span className="font-din font-black text-sm text-[#1cb0f6] uppercase tracking-wider">
                  Listening Challenge
                </span>
                <span className="text-xs font-bold text-[var(--text-sub)]">
                  Listen to the audio and tap the matching words below
                </span>
              </div>
            ) : (
              <span className="font-extrabold text-lg text-[var(--text-main)]">
                {sentence}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Selected Tokens Answer Tray */}
      <div className="min-h-[72px] border-b-2 border-[var(--border-color)] py-3 flex flex-wrap items-center gap-2">
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
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-sidebar)] border-2 border-b-4 border-[var(--border-color)] hover:border-slate-400 font-extrabold text-base text-[var(--text-main)] shadow-sm active:translate-y-0.5 transition-all"
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
                className={`rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--border-color)]/20 font-extrabold text-base px-4 py-2.5 invisible`}
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
                  className="absolute inset-0 px-4 py-2.5 rounded-2xl bg-[var(--bg-sidebar)] border-2 border-b-4 border-[var(--border-color)] hover:border-slate-400 active:border-b-2 font-extrabold text-base text-[var(--text-main)] shadow-sm hover:brightness-105 transition-all flex items-center justify-center"
                >
                  {word}
                </button>
              ) : (
                <div className="absolute inset-0 rounded-2xl bg-[var(--border-color)]/30 border-2 border-[var(--border-color)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
