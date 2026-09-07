"use client";

import React from "react";
import DuoMascot, { MascotMood } from "./DuoMascot";

interface MascotMediaProps {
  state: MascotMood;
  size?: number;
  className?: string;
}

export default function MascotMedia({ state, size = 120, className = "" }: MascotMediaProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <DuoMascot mood={state} size={size} />
    </div>
  );
}
