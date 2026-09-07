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
      <svg
        viewBox="0 0 160 160"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Drop Shadow */}
        <ellipse cx="80" cy="148" rx="45" ry="8" fill="#DDE1E5" opacity="0.6" />

        {/* Feet */}
        <path d="M56 142C56 145 52 147 48 147C44 147 40 145 40 142C40 138 48 138 56 142Z" fill="#E58200" />
        <path d="M120 142C120 145 116 147 112 147C108 147 104 145 104 142C104 138 112 138 120 142Z" fill="#E58200" />

        {/* Body (Signature Duo Green) */}
        <path
          d="M80 18C44 18 32 46 32 86C32 126 48 144 80 144C112 144 128 126 128 86C128 46 116 18 80 18Z"
          fill="#58CC02"
        />

        {/* Belly Plumes (Light Green patch) */}
        <path
          d="M80 72C62 72 50 88 50 112C50 134 64 142 80 142C96 142 110 134 110 112C110 88 98 72 80 72Z"
          fill="#78D61A"
        />

        {/* Wings */}
        {mood === "celebrate" || mood === "excited" ? (
          <>
            {/* Wings Up Celebrating */}
            <path d="M34 76C24 60 16 52 12 56C8 60 16 80 32 94L34 76Z" fill="#46A302" />
            <path d="M126 76C136 60 144 52 148 56C152 60 144 80 128 94L126 76Z" fill="#46A302" />
          </>
        ) : mood === "sad" ? (
          <>
            {/* Drooping Wings */}
            <path d="M32 90C22 102 18 116 22 120C26 124 34 116 36 104L32 90Z" fill="#46A302" />
            <path d="M128 90C138 102 142 116 138 120C134 124 126 116 124 104L128 90Z" fill="#46A302" />
          </>
        ) : (
          <>
            {/* Relaxed Side Wings */}
            <path d="M32 80C22 88 18 102 24 108C28 112 34 104 36 94L32 80Z" fill="#46A302" />
            <path d="M128 80C138 88 142 102 136 108C132 112 126 104 124 94L128 80Z" fill="#46A302" />
          </>
        )}

        {/* Outer Eye Rings (Green) */}
        <circle cx="58" cy="62" r="24" fill="#8CE824" />
        <circle cx="102" cy="62" r="24" fill="#8CE824" />

        {/* Eye Whites */}
        <circle cx="58" cy="62" r="20" fill="#FFFFFF" />
        <circle cx="102" cy="62" r="20" fill="#FFFFFF" />

        {/* Pupils & Expression */}
        {mood === "sad" ? (
          <>
            {/* Sad Eyes Looking Down */}
            <circle cx="58" cy="66" r="10" fill="#3C3C3C" />
            <circle cx="102" cy="66" r="10" fill="#3C3C3C" />
            <circle cx="61" cy="64" r="3" fill="#FFFFFF" />
            <circle cx="105" cy="64" r="3" fill="#FFFFFF" />
            {/* Tear */}
            <path d="M52 76C52 82 46 86 46 86C46 86 40 82 40 76C40 72 44 68 46 66C48 68 52 72 52 76Z" fill="#1CB0F6" />
          </>
        ) : mood === "celebrate" || mood === "excited" ? (
          <>
            {/* Happy Curved Cheerful Eyes */}
            <path d="M48 66C48 58 54 54 62 54C70 54 74 60 74 66" stroke="#3C3C3C" strokeWidth="6" strokeLinecap="round" />
            <path d="M86 66C86 58 92 54 100 54C108 54 112 60 112 66" stroke="#3C3C3C" strokeWidth="6" strokeLinecap="round" />
            {/* Blushing cheeks */}
            <circle cx="42" cy="74" r="6" fill="#FF8686" opacity="0.8" />
            <circle cx="118" cy="74" r="6" fill="#FF8686" opacity="0.8" />
          </>
        ) : mood === "thinking" ? (
          <>
            {/* Looking Up/Right */}
            <circle cx="64" cy="56" r="10" fill="#3C3C3C" />
            <circle cx="108" cy="56" r="10" fill="#3C3C3C" />
            <circle cx="67" cy="53" r="3.5" fill="#FFFFFF" />
            <circle cx="111" cy="53" r="3.5" fill="#FFFFFF" />
          </>
        ) : (
          <>
            {/* Normal Friendly Big Eyes */}
            <circle cx="60" cy="62" r="11" fill="#3C3C3C" />
            <circle cx="104" cy="62" r="11" fill="#3C3C3C" />
            <circle cx="63" cy="59" r="4" fill="#FFFFFF" />
            <circle cx="107" cy="59" r="4" fill="#FFFFFF" />
          </>
        )}

        {/* Orange Beak */}
        <polygon points="70,68 90,68 80,86" fill="#FF9600" />
        <polygon points="73,68 87,68 80,74" fill="#FFAE33" />
      </svg>
    </motion.div>
  );
}

export default DuoMascot;
