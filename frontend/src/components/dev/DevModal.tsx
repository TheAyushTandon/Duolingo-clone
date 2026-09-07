"use client";

import React, { useState } from "react";
import { X, Wrench, Calendar, RotateCcw, Heart, Flame, Sparkles } from "lucide-react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { simulateDay, resetProgress, refillHearts } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSound } from "@/hooks/useSound";

export function DevModal() {
  const { devToolsOpen, toggleDevTools } = usePreferencesStore();
  const queryClient = useQueryClient();
  const { playClick, playCorrect, playHeartLost } = useSound();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const simulateMutation = useMutation({
    mutationFn: (days: number) => simulateDay(days),
    onSuccess: (data) => {
      playCorrect();
      setFeedbackMessage(`Simulated ${data.message} (Streak: ${data.streak})`);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: Error) => {
      playHeartLost();
      setFeedbackMessage(`Error: ${err.message}`);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetProgress,
    onSuccess: (data) => {
      playCorrect();
      setFeedbackMessage(data.message);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: Error) => {
      playHeartLost();
      setFeedbackMessage(`Error: ${err.message}`);
    },
  });

  const refillMutation = useMutation({
    mutationFn: () => refillHearts(true),
    onSuccess: (data) => {
      playCorrect();
      setFeedbackMessage(`Hearts refilled to ${data.hearts}/${data.max_hearts}`);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
    },
    onError: (err: Error) => {
      playHeartLost();
      setFeedbackMessage(`Error: ${err.message}`);
    },
  });

  if (!devToolsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-amber-600">
            <Wrench size={22} />
            <h3 className="font-black text-lg text-slate-800">
              Developer Sandbox
            </h3>
          </div>
          <button
            onClick={() => {
              playClick();
              toggleDevTools();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-500">
          Use these backend-authoritative controls to test gamification logic, edge cases, streak rollover, and heart regeneration without waiting in real-time.
        </p>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 animate-in fade-in">
            {feedbackMessage}
          </div>
        )}

        {/* Controls Grid */}
        <div className="space-y-3">
          {/* Day Simulation */}
          <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar size={16} className="text-indigo-500" />
              Streak Continuity Testing
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => simulateMutation.mutate(1)}
                disabled={simulateMutation.isPending}
                className="py-2.5 px-3 rounded-xl bg-indigo-500 text-white font-black text-xs hover:bg-indigo-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 shadow-[0_3px_0_#3730a3]"
              >
                <Flame size={14} /> +1 Day (Continuity)
              </button>
              <button
                onClick={() => simulateMutation.mutate(2)}
                disabled={simulateMutation.isPending}
                className="py-2.5 px-3 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs hover:bg-indigo-200 active:translate-y-0.5 transition-all"
              >
                +2 Days (Break Streak)
              </button>
            </div>
          </div>

          {/* Hearts Refill */}
          <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
              Heart Mechanics
            </h4>
            <button
              onClick={() => refillMutation.mutate()}
              disabled={refillMutation.isPending}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 shadow-[0_3px_0_#be123c]"
            >
              Instant Full Hearts Refill (5/5)
            </button>
          </div>

          {/* Reset Progress */}
          <div className="p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/50 space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <RotateCcw size={16} />
              Reset State
            </h4>
            <button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 font-black text-xs hover:bg-rose-200 active:translate-y-0.5 transition-all"
            >
              Reset All Progress & Attempts
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => {
            playClick();
            toggleDevTools();
          }}
          className="w-full py-3 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Close Sandbox
        </button>
      </div>
    </div>
  );
}
