"use client";

import React, { useRef, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface TypeAnswerExerciseProps {
  prompt: string;
  promptSentence?: string;
  hint?: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

const ACCENT_CHARS = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

export function TypeAnswerExercise({
  prompt,
  promptSentence,
  hint,
  value,
  onChange,
  disabled,
}: TypeAnswerExerciseProps) {
  const { playClick } = useSound();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const insertChar = (char: string) => {
    playClick();
    onChange(value + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 select-none">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
        {prompt}
      </h2>

      {promptSentence && (
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
          <span className="font-extrabold text-xl text-slate-800 block">
            {promptSentence}
          </span>
          {hint && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-2">
              <Lightbulb size={14} />
              Hint: {hint}
            </span>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type in Spanish..."
          className="w-full p-4 rounded-2xl border-2 border-b-4 border-slate-300 focus:border-[#1cb0f6] focus:outline-none font-extrabold text-xl text-slate-800 placeholder:text-slate-400 bg-white transition-colors"
        />
      </div>

      {/* Spanish Accent Helpers Bar */}
      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {ACCENT_CHARS.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => insertChar(char)}
            disabled={disabled}
            className="w-10 h-10 rounded-xl border-2 border-b-4 border-slate-200 hover:border-slate-300 bg-white font-extrabold text-base text-slate-700 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 transition-all flex items-center justify-center"
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
