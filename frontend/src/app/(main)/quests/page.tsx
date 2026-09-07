"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAchievements, fetchLearningPath } from "@/lib/api";
import { 
  Target, 
  Gift, 
  Trophy, 
  Flame, 
  Brain, 
  Book, 
  Check, 
  Zap, 
  Sparkles 
} from "lucide-react";
import { useSound } from "@/hooks/useSound";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  flame: Flame,
  brain: Brain,
  book: Book,
  trophy: Trophy,
  default: Trophy,
};

export function QuestsPage() {
  const { playClick, playFanfare } = useSound();

  const { data: pathData } = useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
  });

  const { data: achievements, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
  });

  const stats = pathData?.user_stats || { xp: 0, streak: 3 };

  const dailyQuests = [
    {
      id: "q1",
      title: "Earn 20 XP today",
      progress: Math.min(20, (stats.xp % 50)),
      total: 20,
      reward: "10 Gems",
      color: "bg-[#ffc800]",
    },
    {
      id: "q2",
      title: "Complete 1 lesson",
      progress: 1,
      total: 1,
      reward: "Chest",
      color: "bg-[#58cc02]",
    },
    {
      id: "q3",
      title: "Maintain 3-day streak",
      progress: Math.min(3, stats.streak),
      total: 3,
      reward: "15 Gems",
      color: "bg-[#ff9600]",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 select-none pb-24 space-y-10">
      {/* Daily Quests Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-2">
          <Target size={26} className="text-[#ff9600]" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Daily Quests
          </h1>
        </div>
        <p className="text-xs font-bold text-slate-400 mb-6">
          Complete daily challenges to earn bonus gems and unlock mystery chests.
        </p>

        <div className="space-y-3">
          {dailyQuests.map((quest) => {
            const isFinished = quest.progress >= quest.total;
            const pct = Math.min(100, (quest.progress / quest.total) * 100);

            return (
              <div
                key={quest.id}
                className="p-5 rounded-3xl border-2 border-slate-200 bg-white flex items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-800">
                      {quest.title}
                    </span>
                    <span className="text-xs font-black text-slate-400">
                      {quest.progress} / {quest.total}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${quest.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Reward Indicator */}
                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-500">
                  {isFinished ? (
                    <Check size={24} className="text-[#58cc02]" strokeWidth={3} />
                  ) : (
                    <Gift size={22} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lifetime Achievements Section */}
      <section>
        <div className="flex items-center gap-2.5 mb-2">
          <Trophy size={26} className="text-[#ffc800]" />
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Achievements
          </h2>
        </div>
        <p className="text-xs font-bold text-slate-400 mb-6">
          Level up your language profile with badges and XP rewards.
        </p>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {achievements?.map((ach) => {
              const Icon = ICON_MAP[ach.icon] || ICON_MAP.default;

              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between gap-4 ${
                    ach.is_unlocked
                      ? "bg-white border-slate-200"
                      : "bg-slate-50 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Badge Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                        ach.is_unlocked
                          ? "bg-amber-100 border-amber-300 text-amber-500"
                          : "bg-slate-200 border-slate-300 text-slate-400"
                      }`}
                    >
                      <Icon size={28} />
                    </div>

                    <div>
                      <h4 className="font-black text-base text-slate-800">
                        {ach.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward / Status */}
                  <div className="shrink-0 text-right">
                    {ach.is_unlocked ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-wider">
                        <Check size={14} strokeWidth={3} />
                        <span>UNLOCKED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 font-black text-xs">
                        <Zap size={14} className="text-[#ffc800] fill-[#ffc800]" />
                        <span>+{ach.xp_reward} XP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default QuestsPage;
