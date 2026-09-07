"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Trophy, Target, ChevronRight, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard, fetchLearningPath } from "@/lib/api";
import { useSound } from "@/hooks/useSound";

export function RightSidebar() {
  const { playClick } = useSound();

  const { data: pathData } = useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  });

  const userStats = pathData?.user_stats;
  const currentUser = leaderboard?.find((u) => u.is_current_user);
  const topUsers = leaderboard?.slice(0, 3) || [];

  return (
    <aside className="hidden xl:flex flex-col w-96 px-6 py-6 space-y-6 select-none">
      {/* Super Duolingo Promo Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-amber-300 fill-amber-300" size={20} />
          <span className="font-black text-xs uppercase tracking-widest text-amber-200">
            SUPER DUOLINGO
          </span>
        </div>
        <h3 className="font-black text-xl leading-tight mb-2">
          Supercharge your learning
        </h3>
        <p className="text-xs font-semibold text-indigo-100 mb-4">
          Unlimited hearts, no ads, and personalized mistake reviews!
        </p>
        <Link
          href="/shop"
          onClick={playClick}
          className="block w-full text-center py-3 rounded-2xl bg-white text-indigo-600 font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#c7d2fe] hover:bg-indigo-50 active:translate-y-1 active:shadow-none transition-all"
        >
          EXPLORE IN SHOP
        </Link>
      </div>

      {/* Leaderboard Snippet Card */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-[#ffc800] fill-[#ffc800]" />
            <h4 className="font-black text-slate-700 text-sm tracking-wide">
              BRONZE LEAGUE
            </h4>
          </div>
          <Link
            href="/leaderboard"
            onClick={playClick}
            className="text-xs font-black text-[#1cb0f6] uppercase hover:underline flex items-center"
          >
            VIEW ALL <ChevronRight size={14} />
          </Link>
        </div>

        {/* Current User Rank Row */}
        {currentUser && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#ddf4ff] border-2 border-[#84d8ff] mb-3">
            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-[#1cb0f6] w-5">
                #{currentUser.rank}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {currentUser.avatar_url?.startsWith("http") ? (
                  <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">{currentUser.avatar_url || "🦉"}</span>
                )}
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-800 block">
                  {currentUser.username} (You)
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentUser.weekly_xp} XP this week
                </span>
              </div>
            </div>
            <Zap size={18} className="text-[#ffc800] fill-[#ffc800]" />
          </div>
        )}

        {/* Top 3 Competitors */}
        <div className="space-y-2">
          {topUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                user.is_current_user ? "bg-sky-50 font-bold" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 text-center font-black text-xs ${
                    user.rank === 1
                      ? "text-amber-500"
                      : user.rank === 2
                      ? "text-slate-400"
                      : "text-amber-700"
                  }`}
                >
                  {user.rank}
                </span>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {user.avatar_url?.startsWith("http") ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs">{user.avatar_url || "🦉"}</span>
                  )}
                </div>
                <span className="font-extrabold text-xs text-slate-700">
                  {user.username}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {user.weekly_xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Quests Card */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#ff9600]" />
            <h4 className="font-black text-slate-700 text-sm tracking-wide">
              DAILY QUESTS
            </h4>
          </div>
          <Link
            href="/quests"
            onClick={playClick}
            className="text-xs font-black text-[#1cb0f6] uppercase hover:underline flex items-center"
          >
            VIEW ALL <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {/* Quest 1: Earn XP */}
          <div>
            <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
              <span>Earn 20 XP</span>
              <span className="text-slate-400">
                {Math.min(userStats?.xp || 0, 20)} / 20 XP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#ffc800] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (((userStats?.xp || 0) % 50) / 20) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Quest 2: Complete Lessons */}
          <div>
            <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
              <span>Complete 1 lesson</span>
              <span className="text-slate-400">1 / 1</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#58cc02] rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legal & Nav */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 px-2">
        <Link href="/" className="hover:underline">ABOUT</Link>
        <Link href="/shop" className="hover:underline">STORE</Link>
        <Link href="/quests" className="hover:underline">QUESTS</Link>
        <Link href="/profile" className="hover:underline">TERMS</Link>
        <Link href="/profile" className="hover:underline">PRIVACY</Link>
        <span>© 2026 DUOLINGO CLONE</span>
      </div>
    </aside>
  );
}
