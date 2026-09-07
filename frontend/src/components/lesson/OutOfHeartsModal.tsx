"use client";

import React from "react";
import { HeartCrack, Gem, Sparkles, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refillHearts } from "@/lib/api";
import { useSound } from "@/hooks/useSound";
import { DuoMascot } from "@/components/mascot/DuoMascot";

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onRefillSuccess: (newHearts: number) => void;
  onQuit: () => void;
}

export function OutOfHeartsModal({
  isOpen,
  onRefillSuccess,
  onQuit,
}: OutOfHeartsModalProps) {
  const queryClient = useQueryClient();
  const { playClick, playCorrect, playHeartLost } = useSound();

  const refillMutation = useMutation({
    mutationFn: (isPractice: boolean) => refillHearts(isPractice),
    onSuccess: (data) => {
      playCorrect();
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      onRefillSuccess(data.hearts);
    },
    onError: () => {
      playHeartLost();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Mascot / Broken Heart */}
        <div className="w-24 h-24 my-2">
          <DuoMascot mood="sad" className="w-full h-full" />
        </div>

        <h3 className="font-black text-2xl text-slate-800">
          You ran out of hearts!
        </h3>

        <p className="text-sm font-bold text-slate-500 max-w-xs">
          Keep your streak going by refilling your hearts or completing a quick review session.
        </p>

        <div className="w-full space-y-3 pt-2">
          {/* Refill with gems */}
          <button
            onClick={() => refillMutation.mutate(false)}
            disabled={refillMutation.isPending}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1cb0f6] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#1899d6] hover:bg-[#1899d6] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={18} />
              Refill All 5 Hearts
            </span>
            <span className="flex items-center gap-1 font-black bg-white/20 px-2 py-0.5 rounded-lg text-xs">
              350 <Gem size={14} className="fill-white" />
            </span>
          </button>

          {/* Practice refill */}
          <button
            onClick={() => refillMutation.mutate(true)}
            disabled={refillMutation.isPending}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none transition-all"
          >
            Practice to Earn 1 Heart (+1 ❤️)
          </button>

          {/* End session */}
          <button
            onClick={() => {
              playClick();
              onQuit();
            }}
            className="w-full py-3 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-wider transition-colors"
          >
            QUIT TO LEARNING PATH
          </button>
        </div>
      </div>
    </div>
  );
}
