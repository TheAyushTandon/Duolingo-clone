"use client";

import { useCallback } from "react";
import { sounds } from "@/lib/sounds";
import { usePreferencesStore } from "@/stores/usePreferencesStore";

export type SemanticSound = "correct" | "incorrect" | "click" | "complete" | "heart_lost";

export function useSound() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);

  const play = useCallback((type: SemanticSound) => {
    if (!soundEnabled) return;
    switch (type) {
      case "correct":
        sounds.playCorrect();
        break;
      case "incorrect":
        sounds.playIncorrect();
        break;
      case "click":
        sounds.playClick();
        break;
      case "complete":
        sounds.playFanfare();
        break;
      case "heart_lost":
        sounds.playHeartLost();
        break;
    }
  }, [soundEnabled]);

  const speak = useCallback((text: string, lang = "es-ES", rate = 0.9) => {
    if (!soundEnabled) return;
    sounds.speak(text, lang, rate);
  }, [soundEnabled]);

  const playClick = useCallback(() => play("click"), [play]);
  const playCorrect = useCallback(() => play("correct"), [play]);
  const playIncorrect = useCallback(() => play("incorrect"), [play]);
  const playFanfare = useCallback(() => play("complete"), [play]);
  const playHeartLost = useCallback(() => play("heart_lost"), [play]);

  return {
    play,
    speak,
    playClick,
    playCorrect,
    playIncorrect,
    playFanfare,
    playHeartLost,
  };
}
