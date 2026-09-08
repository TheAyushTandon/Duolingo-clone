"use client";

import React, { useRef, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";

interface TypeAnswerExerciseProps {
  prompt: string;
  promptSentence?: string;
  hint?: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  languageCode?: string;
  languageName?: string;
  isSpeechOnly?: boolean;
  locale?: string;
}

const LANGUAGE_ACCENTS: Record<string, string[]> = {
  fr: ["é", "è", "ê", "ë", "à", "â", "ç", "î", "ï", "ô", "ù", "û", "œ"],
  french: ["é", "è", "ê", "ë", "à", "â", "ç", "î", "ï", "ô", "ù", "û", "œ"],
  es: ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"],
  spanish: ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"],
  de: ["ä", "ö", "ü", "ß"],
  german: ["ä", "ö", "ü", "ß"],
  it: ["à", "è", "é", "ì", "í", "ò", "ó", "ù", "ú"],
  italian: ["à", "è", "é", "ì", "í", "ò", "ó", "ù", "ú"],
  pt: ["ã", "õ", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "ç", "à"],
  portuguese: ["ã", "õ", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "ç", "à"],
};

export function TypeAnswerExercise({
  prompt,
  promptSentence,
  hint,
  value,
  onChange,
  disabled,
  languageCode = "fr",
  languageName = "French",
  isSpeechOnly = false,
  locale = "en-US",
}: TypeAnswerExerciseProps) {
  const { playClick, speak } = useSound();
  const { tp } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Spoken text source for audio challenge
  const spokenText = promptSentence || hint || "";

  // Auto-play speech on mount when in speech-only mode
  useEffect(() => {
    if (isSpeechOnly && spokenText) {
      const timer = setTimeout(() => {
        speak(spokenText, locale, 0.9);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSpeechOnly, spokenText, locale, speak]);

  // Detect language from prompt if present (e.g. "Translate into French")
  const promptLower = prompt.toLowerCase();
  let currentLangName = languageName;
  let currentLangKey = languageCode.toLowerCase();

  if (promptLower.includes("french") || promptLower.includes("français")) {
    currentLangName = "French";
    currentLangKey = "fr";
  } else if (promptLower.includes("spanish") || promptLower.includes("español")) {
    currentLangName = "Spanish";
    currentLangKey = "es";
  } else if (promptLower.includes("german") || promptLower.includes("deutsch")) {
    currentLangName = "German";
    currentLangKey = "de";
  } else if (promptLower.includes("italian") || promptLower.includes("italiano")) {
    currentLangName = "Italian";
    currentLangKey = "it";
  }

  const accents = LANGUAGE_ACCENTS[currentLangKey] || LANGUAGE_ACCENTS.fr;

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
      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
        {isSpeechOnly ? tp("Type what you hear") : tp(prompt)}
      </h2>

      {/* Speech-Only Audio Controller (Text is completely hidden!) */}
      {isSpeechOnly && spokenText ? (
        <div className="p-5 rounded-3xl bg-[var(--bg-sidebar)] border-2 border-[var(--border-color)] flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              playClick();
              speak(spokenText, locale, 0.9);
            }}
            className="w-14 h-14 rounded-2xl bg-[#1cb0f6] text-white hover:bg-[#1899d6] active:scale-95 transition-all shadow-[0_4px_0_#1482b6] flex items-center justify-center cursor-pointer shrink-0"
            title="Listen (Normal speed)"
          >
            <span className="text-2xl">🔊</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              speak(spokenText, locale, 0.6);
            }}
            className="w-11 h-11 rounded-2xl bg-[#ff9600] text-white hover:bg-[#e08500] active:scale-95 transition-all shadow-[0_3px_0_#b86d00] flex items-center justify-center cursor-pointer shrink-0 text-xl font-black"
            title="Listen slowly (Turtle speed)"
          >
            🐢
          </button>

          <div className="flex flex-col">
            <span className="font-din font-black text-sm text-[#1cb0f6] uppercase tracking-wider">
              Audio Listening Challenge
            </span>
            <span className="text-xs font-bold text-[var(--text-sub)]">
              Listen carefully and type the words you hear
            </span>
          </div>
        </div>
      ) : promptSentence ? (
        <div className="p-4 rounded-2xl bg-[var(--bg-sidebar)] border-2 border-[var(--border-color)]">
          <span className="font-extrabold text-xl text-[var(--text-main)] block">
            {promptSentence}
          </span>
          {hint && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              <Lightbulb size={14} />
              Hint: {hint}
            </span>
          )}
        </div>
      ) : null}

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Type in ${currentLangName}...`}
          className="w-full p-4 rounded-2xl border-2 border-b-4 border-[var(--border-color)] focus:border-[#1cb0f6] focus:outline-none font-extrabold text-xl text-[var(--text-main)] placeholder:text-[var(--text-sub)]/50 bg-[var(--bg-sidebar)] transition-colors"
        />
      </div>

      {/* Accent Helpers Bar */}
      {accents.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {accents.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => insertChar(char)}
              disabled={disabled}
              className="w-10 h-10 rounded-xl border-2 border-b-4 border-[var(--border-color)] hover:border-slate-400 bg-[var(--bg-sidebar)] font-extrabold text-base text-[var(--text-main)] hover:bg-[var(--border-color)]/20 active:translate-y-0.5 active:border-b-2 transition-all flex items-center justify-center"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
