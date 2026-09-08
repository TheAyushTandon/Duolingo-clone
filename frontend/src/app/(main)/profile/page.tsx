"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import { LiveQuests } from "@/components/live-quests";
import { Zap, Flame, Trophy, Target, BookOpen, Crown, LogOut } from "lucide-react";

import { useAchievements, useProfile, useProfileStats } from "@/hooks/useUserData";
import { logout } from "@/lib/api";

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: stats } = useProfileStats();
  const { data: achievements } = useAchievements();

  const unlocked = achievements?.filter((a) => a.is_unlocked) ?? [];

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <LiveUserProgress />
        <LiveQuests />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col gap-y-8 pb-12">
          {/* Identity header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full border-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-center text-3xl font-black text-[var(--text-sub)] uppercase">
                {profile?.username?.charAt(0) ?? "?"}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-[#131F24]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[var(--text-main)]">
                  {profile?.username?.replace("_", " ") ?? "Learner"}
                </h1>
                <p className="text-sm font-semibold text-[var(--text-sub)]">
                  {profile?.streak_active_today
                    ? "Active today — streak secured! 🔥"
                    : "Complete a lesson to keep your streak!"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-[var(--border-color)] text-[var(--text-sub)] hover:text-rose-500 hover:border-rose-300 hover:bg-rose-500/10 font-black text-sm uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total XP"
              value={profile?.xp ?? 0}
              icon={<Zap size={22} className="text-amber-500 fill-amber-500" />}
              accent="amber"
            />
            <StatCard
              label="Streak"
              value={profile?.streak ?? 0}
              icon={<Flame size={22} className="text-orange-500 fill-orange-500" />}
              accent="orange"
            />
            <StatCard
              label="Gems"
              value={profile?.gems ?? 0}
              icon={<span className="text-xl">💎</span>}
              accent="sky"
            />
          </div>

          {/* Lifetime stats */}
          <div className="rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 space-y-4">
            <h2 className="text-lg font-black text-[var(--text-main)]">
              Learning stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xl font-black text-[var(--text-main)]">
                    {stats?.total_lessons_completed ?? 0}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
                    Lessons completed
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target size={20} className="text-[#58cc02] shrink-0" />
                <div>
                  <div className="text-xl font-black text-[var(--text-main)]">
                    {stats?.skills_completed ?? 0}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
                    Skills completed
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-purple-500 shrink-0" />
                <div>
                  <div className="text-xl font-black text-[var(--text-main)]">
                    {stats?.achievements_count ?? 0}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
                    Achievements
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[var(--text-main)] flex items-center gap-2">
              <Trophy size={20} className="text-purple-500" />
              Achievements ({unlocked.length}/{achievements?.length ?? 0})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements?.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`rounded-2xl border-2 p-4 flex items-center gap-4 transition-colors ${
                    achievement.is_unlocked
                      ? "border-purple-200 bg-purple-50 dark:bg-purple-950/20"
                      : "border-[var(--border-color)] bg-[var(--bg-sidebar)] opacity-60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      achievement.is_unlocked
                        ? "bg-purple-100"
                        : "bg-[var(--border-color)] grayscale"
                    }`}
                  >
                    {achievement.icon || "🏅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-[var(--text-main)]">
                        {achievement.name}
                      </h4>
                      {achievement.is_unlocked && (
                        <Crown size={14} className="text-[#FFC800] fill-[#FFC800]" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-sub)]">
                      {achievement.description}
                    </p>
                    <p className="text-[11px] font-bold text-amber-500 mt-0.5">
                      +{achievement.xp_reward} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "amber" | "orange" | "sky";
}) {
  const accents = {
    amber: "border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-600",
    orange: "border-orange-300 bg-orange-50 dark:bg-orange-950/20 text-orange-600",
    sky: "border-sky-300 bg-sky-50 dark:bg-sky-950/20 text-sky-600",
  };

  return (
    <div className={`rounded-3xl border-2 p-4 flex flex-col items-center gap-1 ${accents[accent]}`}>
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5 font-black text-2xl">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
