"use client";

import React from "react";
import Image from "next/image";

interface RoadmapChestProps {
  onClick?: () => void;
  isUnlocked?: boolean;
}

export function RoadmapChest({ onClick, isUnlocked = false }: RoadmapChestProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center bg-transparent border-none cursor-pointer outline-none hover:scale-105 active:scale-95 transition-transform"
      style={{ width: "96px", height: "80px" }}
      aria-label="Treasure Chest"
    >
      <Image
        src="/chest_clean.png"
        alt="Treasure Chest"
        width={92}
        height={76}
        className="object-contain drop-shadow-md select-none pointer-events-none"
      />
    </button>
  );
}

