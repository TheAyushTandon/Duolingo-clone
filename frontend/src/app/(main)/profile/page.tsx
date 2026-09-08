"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  Target,
  Trophy,
  LogOut,
  Check,
  Lock,
  Sparkles,
  GraduationCap,
} from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import { LiveQuests } from "@/components/live-quests";
import { useAchievements, useProfile, useProfileStats } from "@/hooks/useUserData";
import { logout } from "@/lib/api";
import { useTranslation } from "@/stores/useLanguageStore";

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: stats } = useProfileStats();
  const { data: achievements } = useAchievements();
  const { t } = useTranslation();

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
          <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)]">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full border-4 border-b-[6px] border-[var(--border-color)] bg-black/5 dark:bg-white/5 flex items-center justify-center text-3xl font-black text-[var(--text-sub)] uppercase shrink-0 shadow-inner">
                {profile?.username?.charAt(0) ?? "?"}
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#58CC02] border-3 border-[var(--bg-sidebar)] shadow-xs"
                  title="Online"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-din tracking-tight leading-none">
                  {profile?.username?.replace("_", " ") ?? "Learner"}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[var(--text-sub)]">
                    @{profile?.username?.toLowerCase() ?? "learner"}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 text-xs">·</span>
                  {profile?.streak_active_today ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF9600] text-[11px] font-black">
                      <Image
                        src="/streak.svg"
                        width={14}
                        height={14}
                        alt="Streak active"
                        className="shrink-0"
                      />
                      <span>{t("Active today · Streak secured", "Active today · Streak secured")}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[var(--text-sub)]">
                      {t("Complete a lesson to keep your streak!", "Complete a lesson to keep your streak!")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-sub)] hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/40 hover:bg-rose-500/10 font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:border-b-2 active:translate-y-[2px]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{t("Log out", "Log out")}</span>
            </button>
          </div>

          {/* Unified Duolingo Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t("Total XP", "Total XP")}
              value={profile?.xp ?? 0}
              icon={<Image src="/XP.svg" width={28} height={28} alt="XP" className="shrink-0" />}
            />
            <StatCard
              label={t("Day Streak", "Day streak")}
              value={profile?.streak ?? 0}
              icon={<Image src="/streak.svg" width={26} height={26} alt="Streak" className="shrink-0" />}
            />
            <StatCard
              label={t("Gems", "Gems")}
              value={profile?.gems ?? 0}
              icon={<Image src="/points.svg" width={28} height={28} alt="Gems" className="shrink-0" />}
            />
          </div>

          {/* Learning stats */}
          <div className="rounded-3xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 space-y-4">
            <h2 className="text-lg font-black text-[var(--text-main)] font-din">
              {t("Learning stats", "Learning stats")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <BookOpen size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xl font-black text-[var(--text-main)] font-din leading-none">
                    {stats?.total_lessons_completed ?? 0}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] mt-1">
                    {t("Lessons completed", "Lessons completed")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="w-11 h-11 rounded-xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center shrink-0 border border-[#58CC02]/20">
                  <Target size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xl font-black text-[var(--text-main)] font-din leading-none">
                    {stats?.skills_completed ?? 0}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] mt-1">
                    {t("Skills completed", "Skills completed")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-[#CE82FF] flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Trophy size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xl font-black text-[var(--text-main)] font-din leading-none">
                    {unlocked.length}/{achievements?.length ?? 0}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] mt-1">
                    {t("Achievements", "Achievements")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-[var(--text-main)] font-din">
                  {t("Achievements", "Achievements")}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#58CC02]/15 text-[#58CC02] border border-[#58CC02]/25">
                  {unlocked.length}/{achievements?.length ?? 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements?.map((achievement) => {
                const progress = getAchievementProgress(
                  achievement.name,
                  profile?.xp ?? 0,
                  profile?.streak ?? 0,
                  stats?.total_lessons_completed ?? 0,
                  stats?.skills_completed ?? 0,
                  achievement.is_unlocked
                );

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl border-2 border-b-4 p-4 flex items-start gap-4 transition-all ${
                      achievement.is_unlocked
                        ? "border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:border-slate-300 dark:hover:border-[#4B5C67]"
                        : "border-[var(--border-color)] bg-[var(--bg-sidebar)] opacity-60"
                    }`}
                  >
                    {renderAchievementBadge(achievement.name, achievement.is_unlocked)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-sm text-[var(--text-main)] truncate">
                          {achievement.name}
                        </h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500 font-black text-[11px] shrink-0">
                          <Image src="/XP.svg" width={12} height={12} alt="XP" />
                          <span>+{achievement.xp_reward} XP</span>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-[var(--text-sub)] mt-0.5 line-clamp-2">
                        {achievement.description}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-sub)] mb-1">
                          <span>
                            {progress.current} / {progress.target} {progress.unit}
                          </span>
                          {achievement.is_unlocked && (
                            <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider">
                              {t("Completed", "Completed")}
                            </span>
                          )}
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              achievement.is_unlocked ? "bg-[#58CC02]" : "bg-sky-500"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, progress.percent))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl border-2 border-b-4 border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:border-slate-300 dark:hover:border-[#4B5C67] transition-all">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xl sm:text-2xl font-black font-din text-[var(--text-main)] leading-none tracking-tight">
          {value.toLocaleString()}
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-sub)] mt-1 truncate">
          {label}
        </span>
      </div>
    </div>
  );
}

function getAchievementProgress(
  name: string,
  profileXp: number,
  streak: number,
  lessonsCompleted: number,
  skillsCompleted: number,
  isUnlocked: boolean
) {
  switch (name) {
    case "First Steps": {
      const current = isUnlocked ? 1 : Math.min(lessonsCompleted, 1);
      return { current, target: 1, unit: "lesson", percent: (current / 1) * 100 };
    }
    case "XP Explorer": {
      const current = isUnlocked ? 100 : Math.min(profileXp, 100);
      return { current, target: 100, unit: "XP", percent: (current / 100) * 100 };
    }
    case "Week Warrior": {
      const current = isUnlocked ? 7 : Math.min(streak, 7);
      return { current, target: 7, unit: "days", percent: Math.round((current / 7) * 100) };
    }
    case "Skill Master": {
      const current = isUnlocked ? 1 : Math.min(skillsCompleted, 1);
      return { current, target: 1, unit: "skill", percent: (current / 1) * 100 };
    }
    case "Dedicated Learner": {
      const current = isUnlocked ? 5 : Math.min(lessonsCompleted, 5);
      return { current, target: 5, unit: "lessons", percent: Math.round((current / 5) * 100) };
    }
    default: {
      return { current: isUnlocked ? 1 : 0, target: 1, unit: "", percent: isUnlocked ? 100 : 0 };
    }
  }
}

function renderAchievementBadge(name: string, isUnlocked: boolean) {
  if (!isUnlocked) {
    return (
      <div className="relative w-14 h-14 rounded-2xl bg-black/10 dark:bg-white/5 border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
        <Lock size={20} strokeWidth={2.5} className="opacity-60" />
        <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] flex items-center justify-center shadow-xs">
          <span className="text-[8px] font-black uppercase text-[var(--text-sub)] tracking-wider">
            Locked
          </span>
        </div>
      </div>
    );
  }

  switch (name) {
    case "First Steps":
      return (
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#58CC02] to-[#46A302] border-2 border-[#58CC02] border-b-4 border-b-[#388502] flex items-center justify-center text-white shrink-0 shadow-md">
          <Sparkles size={24} strokeWidth={2.5} className="drop-shadow-sm" />
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-emerald-500/40 shadow-xs flex items-center gap-0.5 text-emerald-500">
            <Check size={9} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase tracking-wider">DONE</span>
          </div>
        </div>
      );
    case "XP Explorer":
      return (
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FFC800] to-[#E5A400] border-2 border-[#FFC800] border-b-4 border-b-[#B88400] flex items-center justify-center text-slate-900 shrink-0 shadow-md">
          <Image src="/XP.svg" width={28} height={28} alt="XP" className="drop-shadow-sm" />
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-amber-500/40 shadow-xs flex items-center gap-0.5 text-amber-500">
            <Check size={9} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase tracking-wider">DONE</span>
          </div>
        </div>
      );
    case "Week Warrior":
      return (
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FF9600] to-[#E07500] border-2 border-[#FF9600] border-b-4 border-b-[#B35E00] flex items-center justify-center text-white shrink-0 shadow-md">
          <Image src="/streak.svg" width={26} height={26} alt="Streak" className="drop-shadow-sm" />
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-orange-500/40 shadow-xs flex items-center gap-0.5 text-orange-500">
            <Check size={9} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase tracking-wider">DONE</span>
          </div>
        </div>
      );
    case "Skill Master":
      return (
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#CE82FF] to-[#A855F7] border-2 border-[#CE82FF] border-b-4 border-b-[#8935D8] flex items-center justify-center text-white shrink-0 shadow-md">
          <Trophy size={24} strokeWidth={2.5} className="drop-shadow-sm" />
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-purple-500/40 shadow-xs flex items-center gap-0.5 text-[#CE82FF]">
            <Check size={9} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase tracking-wider">DONE</span>
          </div>
        </div>
      );
    case "Dedicated Learner":
    default:
      return (
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1CB0F6] to-[#1899D6] border-2 border-[#1CB0F6] border-b-4 border-b-[#1279AB] flex items-center justify-center text-white shrink-0 shadow-md">
          <GraduationCap size={24} strokeWidth={2.5} className="drop-shadow-sm" />
          <div className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-[var(--bg-sidebar)] border border-sky-500/40 shadow-xs flex items-center gap-0.5 text-[#1CB0F6]">
            <Check size={9} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase tracking-wider">DONE</span>
          </div>
        </div>
      );
  }
}
