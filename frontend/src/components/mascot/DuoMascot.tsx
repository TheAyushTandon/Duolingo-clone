"use client";

import React from "react";
import { motion } from "framer-motion";

export type MascotMood = "happy" | "celebrate" | "sad" | "thinking" | "excited";

interface DuoMascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

export function DuoMascot({ mood = "happy", size = 120, className = "" }: DuoMascotProps) {
  // SVG proportions designed to capture Duolingo owl's signature green, orange beak, big eyes
  const variants = {
    happy: {
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const }
    },
    celebrate: {
      rotate: [-4, 4, -4],
      y: [0, -12, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" as const }
    },
    sad: {
      y: [0, 4, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const }
    },
    thinking: {
      rotate: [0, 8, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" as const }
    },
    excited: {
      scale: [1, 1.08, 1],
      y: [0, -8, 0],
      transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" as const }
    }
  };

  return (
    <motion.div
      animate={mood}
      variants={variants}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <img
        src="/notepad-duo.svg"
        alt="Duolingo Owl"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </motion.div>
  );
}

export default DuoMascot;
