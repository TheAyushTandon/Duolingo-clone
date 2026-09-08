"use client";

import React from "react";

interface RoadmapMascotProps {
  className?: string;
}

export function RoadmapMascot({ className = "" }: RoadmapMascotProps) {
  return (
    <div className={`flex flex-col items-center select-none pointer-events-none transition-transform hover:scale-105 duration-300 ${className}`}>
      <video
        src="/canvas-animation-1788809231976.webm"
        autoPlay
        loop
        muted
        playsInline
        className="w-[146px] h-[156px] object-contain drop-shadow-xl"
      />
    </div>
  );
}


