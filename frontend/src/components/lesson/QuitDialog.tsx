"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DuoMascot } from "@/components/mascot/DuoMascot";
import { useSound } from "@/hooks/useSound";

interface QuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmQuit: () => void;
}

export function QuitDialog({ isOpen, onClose, onConfirmQuit }: QuitDialogProps) {
  const { playClick } = useSound();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Sad Duo Mascot */}
        <div className="w-28 h-28 my-1">
          <DuoMascot mood="sad" className="w-full h-full" />
        </div>

        <h3 className="font-black text-2xl text-slate-800">
          Wait, don't leave!
        </h3>

        <p className="text-sm font-bold text-slate-500">
          You'll lose your progress in this lesson if you quit now.
        </p>

        <div className="w-full space-y-3 pt-2">
          {/* Keep Learning Button */}
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none transition-all"
          >
            KEEP LEARNING
          </button>

          {/* Confirm Quit Button */}
          <button
            onClick={() => {
              playClick();
              onConfirmQuit();
            }}
            className="w-full py-3 rounded-2xl text-rose-500 hover:bg-rose-50 font-black text-sm uppercase tracking-wider transition-colors"
          >
            END SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
