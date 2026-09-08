"use client";

import { create } from "zustand";
import { LanguageCode, translateText, translatePrompt } from "@/lib/translations";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

const STORAGE_KEY = "duo_site_language";

function getInitialLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "hi" || saved === "en") return saved;
  return "en";
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language: LanguageCode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, language);
    }
    set({ language });
  },
}));

/**
 * Convenience hook for components to translate UI strings and prompts.
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const t = (key: string, defaultVal?: string) => {
    return translateText(key, language) || defaultVal || key;
  };

  const tp = (prompt: string) => {
    return translatePrompt(prompt, language);
  };

  return { language, setLanguage, t, tp };
}
