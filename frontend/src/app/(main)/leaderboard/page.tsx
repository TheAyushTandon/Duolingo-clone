"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "@/lib/api";
import { Trophy, Shield, Clock, Flame, Zap, ArrowUp } from "lucide-react";
import { useSound } from "@/hooks/useSound";

export default function LeaderboardPage() {
  const { playClick } = useSound();

  const { data: users, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  });

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 select-none pb-24">
      {/* League Header Card */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-500 shadow-md">
          <Shield size={52} className="fill-amber-400 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Bronze League
        </h1>
        <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5 mt-1">
          <Clock size={14} />
          <span>Top 3 advance to Silver League • 6 days left</span>
        </p>
      </div>

      {/* Promotion Zone Banner */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700 uppercase tracking-wider mb-4">
        <ArrowUp size={16} />
        <span>PROMOTION ZONE (TOP 3)</span>
      </div>

      {/* Leaderboard Table List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users?.map((user) => {
            const isTop3 = user.rank <= 3;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                  user.is_current_user
                    ? "bg-[#ddf4ff] border-[#84d8ff] shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-4">
                  {/* Rank Number / Medal */}
                  <div className="w-7 text-center">
                    {user.rank === 1 ? (
                      <span className="font-black text-lg text-[#ffc800] flex items-center justify-center">
                        <Trophy size={20} className="fill-[#ffc800]" />
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="font-black text-base text-slate-400">
                        2
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="font-black text-base text-amber-700">
                        3
                      </span>
                    ) : (
                      <span className="font-black text-sm text-slate-400">
                        {user.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar Icon */}
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200">
                    {user.avatar_url?.startsWith("http") ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      user.avatar_url || "🦉"
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <span
                      className={`font-extrabold text-base block ${
                        user.is_current_user
                          ? "text-[#1899d6]"
                          : "text-slate-800"
                      }`}
                    >
                      {user.username} {user.is_current_user && "(You)"}
                    </span>
                    {user.is_current_user && (
                      <span className="text-[11px] font-bold text-[#1cb0f6] uppercase tracking-wider block">
                        Current Learner
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: XP */}
                <div className="flex items-center gap-1.5 font-black text-sm text-slate-700">
                  <Zap size={16} className="text-[#ffc800] fill-[#ffc800]" />
                  <span>{user.weekly_xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
