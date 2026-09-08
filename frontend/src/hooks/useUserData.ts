"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchLearningPath,
  fetchProfile,
  fetchProfileStats,
  fetchLeaderboard,
  fetchAchievements,
  fetchProfileActivity,
} from "@/lib/api";

/**
 * Shared query hooks. One key per resource means every page and the sidebar
 * widgets read from the same cache — a lesson completion invalidates
 * "learningPath" and the whole UI updates.
 */

export function useLearningPath() {
  return useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
    staleTime: 30_000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 30_000,
  });
}

export function useProfileStats() {
  return useQuery({
    queryKey: ["profileStats"],
    queryFn: fetchProfileStats,
    staleTime: 30_000,
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: fetchAchievements,
    staleTime: 60_000,
  });
}

/** Today's XP and lessons (for daily quests). */
export function useTodayActivity() {
  return useQuery({
    queryKey: ["activity", "today"],
    queryFn: async () => {
      const page = await fetchProfileActivity();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const localStr = `${year}-${month}-${day}`;
      const utcStr = now.toISOString().slice(0, 10);

      // Match either local date or UTC date string from activity history
      let row = page.items.find(
        (i) => i.activity_date === localStr || i.activity_date === utcStr
      );

      // Fallback: if newest entry is within the current 24-hour cycle, count it as today
      if (!row && page.items.length > 0) {
        const latest = page.items[0];
        const itemDate = new Date(latest.activity_date);
        const diffHours = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60);
        if (diffHours >= -12 && diffHours < 36) {
          row = latest;
        }
      }

      return {
        xp: row?.xp_earned ?? 0,
        lessons: row?.lessons_completed ?? 0,
      };
    },
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });
}
