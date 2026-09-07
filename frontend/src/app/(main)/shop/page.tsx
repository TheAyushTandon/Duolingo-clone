"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLearningPath, refillHearts } from "@/lib/api";
import { 
  Heart, 
  Gem, 
  Snowflake, 
  Flame, 
  Sparkles, 
  Check, 
  ShieldAlert 
} from "lucide-react";
import { useSound } from "@/hooks/useSound";
import confetti from "canvas-confetti";

export function ShopPage() {
  const queryClient = useQueryClient();
  const { playClick, playCorrect, playHeartLost, playFanfare } = useSound();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuperActive, setIsSuperActive] = useState(false);

  const { data: pathData } = useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
  });

  const stats = pathData?.user_stats || {
    gems: 450,
    hearts: 5,
    max_hearts: 5,
  };

  const refillMutation = useMutation({
    mutationFn: () => refillHearts(false),
    onSuccess: (res) => {
      playCorrect();
      setFeedback("Hearts successfully refilled to 5!");
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err: Error) => {
      playHeartLost();
      setFeedback(`Error: ${err.message}`);
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const handleSuperTrial = () => {
    playFanfare();
    setIsSuperActive(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a855f7", "#ec4899"],
    });
    setFeedback("Super Duolingo activated! Enjoy unlimited hearts!");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 select-none pb-24 space-y-10">
      {/* Super Duolingo Hero Card */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="max-w-md space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest text-amber-300">
            <Sparkles size={14} className="fill-amber-300" />
            SUPER DUOLINGO
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            Learn faster with Super
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-indigo-100">
            No ads, unlimited hearts, and unlimited mistake practice sessions.
          </p>
          <button
            onClick={handleSuperTrial}
            disabled={isSuperActive}
            className="mt-2 px-6 py-3 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#c7d2fe] hover:bg-indigo-50 active:translate-y-1 active:shadow-none transition-all"
          >
            {isSuperActive ? "SUPER ACTIVATED ✨" : "START 2-WEEK FREE TRIAL"}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 text-xs font-black text-sky-800 animate-in fade-in flex items-center justify-between">
          <span>{feedback}</span>
          <Check size={18} className="text-sky-600" />
        </div>
      )}

      {/* Hearts Section */}
      <section className="space-y-4">
        <h3 className="font-black text-xl text-slate-800 tracking-tight">
          Hearts
        </h3>

        <div className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-[#ff4b4b] shrink-0">
              <Heart size={30} className="fill-[#ff4b4b]" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-800">
                Refill Hearts
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                Get full hearts so you can keep learning without pauses.
              </p>
            </div>
          </div>

          <button
            onClick={() => refillMutation.mutate()}
            disabled={stats.hearts >= stats.max_hearts || stats.gems < 350 || refillMutation.isPending}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
              stats.hearts >= stats.max_hearts
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-[#1cb0f6] text-white shadow-[0_4px_0_#1899d6] hover:bg-[#1899d6] active:translate-y-1 active:shadow-none"
            }`}
          >
            {stats.hearts >= stats.max_hearts ? (
              <span>FULL</span>
            ) : (
              <>
                <span>350</span>
                <Gem size={14} className="fill-white" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Power-ups Section */}
      <section className="space-y-4">
        <h3 className="font-black text-xl text-slate-800 tracking-tight">
          Power-Ups
        </h3>

        {/* Streak Freeze */}
        <div className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-sky-500 shrink-0">
              <Snowflake size={30} />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-800">
                Streak Freeze
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                Streak Freeze allows your streak to remain intact for one full day of inactivity.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCorrect();
              setFeedback("Streak Freeze equipped!");
            }}
            className="px-5 py-3 rounded-2xl bg-[#1cb0f6] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_0_#1899d6] hover:bg-[#1899d6] active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <span>200</span>
            <Gem size={14} className="fill-white" />
          </button>
        </div>

        {/* Double or Nothing */}
        <div className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
              <Flame size={30} className="fill-amber-500" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-800">
                Double or Nothing
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                Attempt to double your 50 gem wager by maintaining a 7-day streak.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playCorrect();
              setFeedback("Wager accepted! Maintain 7 days to double your gems!");
            }}
            className="px-5 py-3 rounded-2xl bg-[#ffc800] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_4px_0_#e5a500] hover:bg-[#e5a500] active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <span>50</span>
            <Gem size={14} className="fill-white" />
          </button>
        </div>
      </section>
    </div>
  );
}

export default ShopPage;
