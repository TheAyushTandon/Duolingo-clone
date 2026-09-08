"use client";

import React, { useState } from "react";
import { BookOpen, Trophy } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { GuidebookModal } from "./GuidebookModal";

interface UnitBannerProps {
  unitIndex: number;
  title: string;
  description: string;
  bannerColor?: string;
}

export function UnitBanner({
  unitIndex,
  title,
  description,
  bannerColor = "bg-[#58cc02]",
}: UnitBannerProps) {
  const { playClick } = useSound();
  const [showGuidebook, setShowGuidebook] = useState(false);

  return (
    <>
      <div className={`w-full max-w-xl mx-auto rounded-3xl ${bannerColor} text-white p-5 shadow-sm mb-8 relative overflow-hidden select-none`}>
        {/* Background decorative pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-36 opacity-15 pointer-events-none flex items-center justify-center">
          <Trophy size={140} />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1 max-w-[70%]">
            <span className="font-black text-xs uppercase tracking-widest text-white/85 block">
              SECTION 1, UNIT {unitIndex + 1}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight !text-white font-din drop-shadow-sm">
              {title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-white/95">
              {description}
            </p>
          </div>

          {/* Guidebook Button */}
          <button
            onClick={() => {
              playClick();
              setShowGuidebook(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 font-black text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">GUIDEBOOK</span>
          </button>
        </div>
      </div>

      {showGuidebook && (
        <GuidebookModal
          unitIndex={unitIndex + 1}
          unitTitle={title}
          onClose={() => setShowGuidebook(false)}
        />
      )}
    </>
  );
}
