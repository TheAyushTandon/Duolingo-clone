"use client";

import React, { useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";

import { useLeaderboard } from "@/hooks/useUserData";

const STATUS_EMOJIS = ["🦉", "🎉", "💪", "👀", "🍿", "🇫🇷", "😎", "💯", "💩", "🏆", "🧰", "🐱"];

const PROMOTION_CUTOFF = 5; // Top 5 promote (Duolingo-style)

export default function LeaderboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { data: entries, isLoading } = useLeaderboard();
  const myEntry = entries?.find((e) => e.is_current_user);

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6 font-din">
      <StickyWrapper>
        <LiveUserProgress />

        {/* Set your status widget */}
        <div className="rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-5 space-y-4">
          <h3 className="font-extrabold text-base text-[var(--text-main)]">
            Set your status
          </h3>

          <div className="flex justify-center my-2">
            <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-main)]">
              <span className="text-2xl font-black text-[var(--text-sub)]">
                {selectedStatus || (myEntry?.username ? myEntry.username.charAt(0).toUpperCase() : "U")}
              </span>
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#131F24]" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-1">
            {STATUS_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedStatus(emoji)}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${
                  selectedStatus === emoji
                    ? "border-sky-400 bg-sky-400/10 scale-105"
                    : "border-[var(--border-color)] hover:bg-[var(--border-color)]/30"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)]">
          <Link href="#" className="hover:underline">About</Link>
          <Link href="#" className="hover:underline">Blog</Link>
          <Link href="#" className="hover:underline">Store</Link>
          <Link href="#" className="hover:underline">Efficacy</Link>
          <Link href="#" className="hover:underline">Careers</Link>
          <Link href="#" className="hover:underline">Investors</Link>
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
        </div>
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center gap-y-6">
          {/* League Badges Header */}
          <div className="flex items-center gap-3 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`relative flex items-center justify-center rounded-2xl border-2 transition-all ${
                  i === 0
                    ? "w-20 h-24 bg-gradient-to-b from-amber-600/30 to-amber-800/40 border-amber-600 shadow-md scale-105"
                    : "w-14 h-16 bg-[var(--border-color)]/40 border-[var(--border-color)] opacity-60"
                }`}
              >
                {i === 0 ? (
                  <span className="text-3xl drop-shadow">🪶</span>
                ) : (
                  <Shield className="w-6 h-6 text-[var(--text-sub)] opacity-40" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-[var(--text-main)]">
              Bronze League
            </h1>
            <p className="text-sm font-semibold text-[var(--text-sub)]">
              Top {PROMOTION_CUTOFF} learners advance to the next league
            </p>
          </div>

          {/* Ranked rows */}
          <div className="w-full space-y-3 pt-4">
            {isLoading &&
              [1, 2, 3, 4, 5, 6].map((rank) => (
                <div
                  key={rank}
                  className="flex items-center justify-between px-6 py-4 rounded-2xl opacity-40 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-4 rounded-full bg-[var(--border-color)]" />
                    <div className="w-10 h-10 rounded-full bg-[var(--border-color)]" />
                    <div className="h-4 w-28 rounded-full bg-[var(--border-color)]" />
                  </div>
                  <div className="h-4 w-12 rounded-full bg-[var(--border-color)]" />
                </div>
              ))}

            {entries?.map((entry) => {
              const isPromotionZone = entry.rank <= PROMOTION_CUTOFF;
              const isMe = entry.is_current_user;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-colors ${
                    isMe
                      ? "border-[var(--border-color)] bg-[var(--bg-sidebar)] shadow-sm"
                      : "border-transparent hover:bg-[var(--border-color)]/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank / promotion indicator */}
                    <span
                      className={`font-black text-sm w-6 text-center ${
                        isPromotionZone ? "text-emerald-500" : "text-[var(--text-sub)]"
                      }`}
                    >
                      {entry.rank}
                    </span>

                    <div className="relative w-10 h-10 rounded-full border-2 border-dashed border-[var(--border-color)] flex items-center justify-center">
                      <span className="text-sm font-black text-[var(--text-sub)]">
                        {isMe && selectedStatus
                          ? selectedStatus
                          : entry.username
                          ? entry.username.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                      {isMe && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-white dark:border-[#131F24]" />
                      )}
                    </div>

                    <span className="font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                      <span>{entry.username}</span>
                      {isMe && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                          You
                        </span>
                      )}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 font-black text-sm text-[var(--text-sub)]">
                    <Zap size={14} className="fill-[#FFC800] text-[#FFC800]" />
                    {entry.weekly_xp} XP
                  </span>
                </div>
              );
            })}
          </div>

          <Link href="/learn">
            <Button
              variant="default"
              className="px-8 border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] text-sky-400 dark:text-sky-400 font-extrabold text-xs uppercase tracking-wider hover:bg-[var(--border-color)]/20 shadow-sm"
            >
              Earn more XP
            </Button>
          </Link>
        </div>
      </FeedWrapper>
    </div>
  );
}
