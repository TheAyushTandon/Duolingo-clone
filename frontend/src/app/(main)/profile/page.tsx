"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, fetchProfileStats } from "@/lib/api";
import { 
  Flame, 
  Zap, 
  Shield, 
  Trophy, 
  Clock, 
  Calendar, 
  Wrench, 
  Check, 
  UserCheck 
} from "lucide-react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useSound } from "@/hooks/useSound";

export function ProfilePage() {
  const { toggleDevTools } = usePreferencesStore();
  const { playClick } = useSound();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const { data: stats } = useQuery({
    queryKey: ["profileStats"],
    queryFn: fetchProfileStats,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-slate-100 rounded-3xl" />
          <div className="h-28 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const user = profile || {
    username: "LanguageHero",
    email: "learner@duo.clone",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=DuoLearner",
    xp: 135,
    streak: 3,
    gems: 465,
    achievements: [],
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 select-none pb-24 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-slate-200 bg-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-[#58cc02] overflow-hidden flex items-center justify-center text-4xl shrink-0 shadow-md">
          {user.avatar_url?.startsWith("http") ? (
            <img src={user.avatar_url} alt={user.username} className="w-full h-full" />
          ) : (
            <span>🦉</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
            {user.username}
          </h1>
          <p className="text-xs font-bold text-slate-400">
            @{user.username.toLowerCase()} • Joined September 2026
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-black text-slate-600">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100">
              <span>🇪🇸</span> Spanish
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <UserCheck size={16} /> 0 Following • 1 Follower
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Statistics
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Day Streak */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-[#ff9600]">
              <Flame size={26} className="fill-[#ff9600]" />
            </div>
            <div>
              <span className="font-black text-xl text-slate-800 block">
                {user.streak}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Day Streak
              </span>
            </div>
          </div>

          {/* Total XP */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-[#ffc800]">
              <Zap size={26} className="fill-[#ffc800]" />
            </div>
            <div>
              <span className="font-black text-xl text-slate-800 block">
                {user.xp}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total XP
              </span>
            </div>
          </div>

          {/* Current League */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-[#1cb0f6]">
              <Shield size={26} className="fill-[#1cb0f6]" />
            </div>
            <div>
              <span className="font-black text-xl text-slate-800 block">
                Bronze
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current League
              </span>
            </div>
          </div>

          {/* Top 3 Finishes */}
          <div className="p-4 rounded-3xl border-2 border-slate-200 bg-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-[#ce82ff]">
              <Trophy size={26} className="fill-[#ce82ff]" />
            </div>
            <div>
              <span className="font-black text-xl text-slate-800 block">
                1
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Top 3 Finishes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Sandbox Section */}
      <section className="p-6 rounded-3xl border-2 border-amber-200 bg-amber-50/60 flex items-center justify-between">
        <div>
          <h3 className="font-black text-base text-amber-900 flex items-center gap-2">
            <Wrench size={18} />
            Developer Simulation Sandbox
          </h3>
          <p className="text-xs font-bold text-amber-700 mt-1">
            Simulate day rollovers, test streak continuity, reset progress, or refill hearts.
          </p>
        </div>

        <button
          onClick={() => {
            playClick();
            toggleDevTools();
          }}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#b45309] hover:bg-amber-600 active:translate-y-0.5 active:shadow-none transition-all shrink-0"
        >
          OPEN SANDBOX
        </button>
      </section>
    </div>
  );
}

export default ProfilePage;
