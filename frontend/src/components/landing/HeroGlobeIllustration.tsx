"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroGlobeIllustration() {
  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[480px] aspect-square flex items-center justify-center select-none">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer glow ring */}
          <circle cx="250" cy="270" r="165" fill="#E8F7FE" />

          {/* Planet Earth Base (Vibrant Duolingo Blue) */}
          <circle cx="250" cy="270" r="150" fill="#1CB0F6" />
          {/* Earth Shadow (3D depth) */}
          <path
            d="M250 120 C332.8 120 400 187.2 400 270 C400 352.8 332.8 420 250 420 C210 420 230 380 230 340 C230 260 210 180 250 120 Z"
            fill="#1899D6"
            opacity="0.3"
          />

          {/* Continents (Emerald Duo Green) */}
          {/* Americas */}
          <path
            d="M170 200 C180 180 210 190 220 210 C230 230 210 260 195 280 C180 300 170 330 185 360 C195 380 170 395 155 380 C140 365 145 330 150 300 C155 270 140 240 150 220 Z"
            fill="#58CC02"
          />
          {/* Europe & Africa */}
          <path
            d="M270 170 C290 160 320 175 330 195 C340 215 325 240 335 260 C345 280 360 310 340 340 C320 370 290 350 280 320 C270 290 285 260 275 230 C265 200 250 180 270 170 Z"
            fill="#58CC02"
          />
          {/* Asia / Islands */}
          <ellipse cx="330" cy="220" rx="22" ry="14" fill="#58CC02" />
          <circle cx="230" cy="350" r="14" fill="#58CC02" />
          <circle cx="205" cy="370" r="8" fill="#58CC02" />

          {/* Floating Clouds */}
          <motion.g
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Cloud 1 */}
            <path
              d="M100 250 C100 238 112 228 126 230 C132 220 148 220 156 230 C166 228 176 238 176 250 C176 262 164 270 150 270 L120 270 C108 270 100 262 100 250 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
            {/* Cloud 2 */}
            <path
              d="M330 330 C330 320 340 310 352 312 C358 304 372 304 378 312 C388 310 396 320 396 330 C396 340 386 348 374 348 L348 348 C338 348 330 340 330 330 Z"
              fill="#FFFFFF"
              opacity="0.92"
            />
          </motion.g>

          {/* World Landmarks perched on the globe */}
          {/* Eiffel Tower (Left) */}
          <path
            d="M165 170 L175 125 L185 170 Z"
            fill="#E5E5E5"
            stroke="#4B4B4B"
            strokeWidth="3"
          />
          <line x1="162" y1="155" x2="188" y2="155" stroke="#4B4B4B" strokeWidth="3" />
          <line x1="175" y1="125" x2="175" y2="115" stroke="#4B4B4B" strokeWidth="3" />

          {/* Torii Gate (Right) */}
          <g transform="translate(320, 130)">
            <rect x="0" y="8" width="5" height="32" fill="#FF4B4B" />
            <rect x="25" y="8" width="5" height="32" fill="#FF4B4B" />
            <rect x="-4" y="4" width="38" height="6" rx="2" fill="#FF4B4B" />
            <rect x="-2" y="12" width="34" height="4" fill="#FF4B4B" />
          </g>

          {/* DUO THE OWL (Standing proudly on top of the world) */}
          <g transform="translate(180, 50)">
            {/* Shadow under Duo */}
            <ellipse cx="70" cy="118" rx="40" ry="8" fill="#1899D6" opacity="0.4" />

            {/* Feet */}
            <path d="M52 114 C52 118 48 120 44 120 C40 120 36 118 36 114 C36 110 44 110 52 114 Z" fill="#E58200" />
            <path d="M96 114 C96 118 92 120 88 120 C84 120 80 118 80 114 C80 110 88 110 96 114 Z" fill="#E58200" />

            {/* Body */}
            <path
              d="M70 12 C38 12 28 36 28 72 C28 108 42 116 70 116 C98 116 112 108 112 72 C112 36 102 12 70 12 Z"
              fill="#58CC02"
            />
            {/* 3D Body Edge shadow */}
            <path
              d="M70 12 C102 12 112 36 112 72 C112 108 98 116 70 116 C85 116 98 105 98 72 C98 36 85 12 70 12 Z"
              fill="#46A302"
              opacity="0.3"
            />

            {/* Belly */}
            <path
              d="M70 56 C54 56 44 70 44 90 C44 108 56 114 70 114 C84 114 96 108 96 90 C96 70 86 56 70 56 Z"
              fill="#78D61A"
            />

            {/* Left Wing (Waving cheerful hello!) */}
            <motion.path
              d="M30 65 C18 52 10 44 6 48 C2 52 12 70 28 80 Z"
              fill="#46A302"
              animate={{ rotate: [-8, 14, -8] }}
              style={{ originX: "28px", originY: "75px" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
            {/* Right Wing */}
            <path d="M110 65 C120 72 124 84 118 90 C114 94 108 86 106 78 Z" fill="#46A302" />

            {/* Eyes Outer Rings */}
            <circle cx="50" cy="48" r="20" fill="#8CE824" />
            <circle cx="90" cy="48" r="20" fill="#8CE824" />

            {/* Eye Whites */}
            <circle cx="50" cy="48" r="16.5" fill="#FFFFFF" />
            <circle cx="90" cy="48" r="16.5" fill="#FFFFFF" />

            {/* Pupils with playful glimmer */}
            <circle cx="52" cy="48" r="9" fill="#3C3C3C" />
            <circle cx="92" cy="48" r="9" fill="#3C3C3C" />
            <circle cx="54" cy="45" r="3" fill="#FFFFFF" />
            <circle cx="94" cy="45" r="3" fill="#FFFFFF" />

            {/* Beak */}
            <polygon points="62,54 78,54 70,68" fill="#FF9600" />
            <polygon points="64,54 76,54 70,59" fill="#FFAE33" />
          </g>

          {/* Sparkles / Magic Stars */}
          <motion.g
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Star Top Right */}
            <polygon points="360,90 364,100 375,102 366,110 369,120 360,113 351,120 354,110 345,102 356,100" fill="#FFC800" />
            {/* Star Top Left */}
            <polygon points="120,110 123,117 132,118 125,124 127,132 120,126 113,132 115,124 108,118 117,117" fill="#FFC800" />
            {/* Small diamond */}
            <polygon points="390,210 395,218 390,226 385,218" fill="#CE82FF" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
