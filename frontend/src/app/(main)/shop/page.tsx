"use client";

import { useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import { LiveQuests } from "@/components/live-quests";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Zap, CheckCircle2 } from "lucide-react";

import { refillHearts } from "@/lib/api";
import { useLearningPath } from "@/hooks/useUserData";
import { useSound } from "@/hooks/useSound";

const REFILL_COST = 350;

export default function ShopPage() {
  const queryClient = useQueryClient();
  const { data: path } = useLearningPath();
  const { playCorrect, playHeartLost } = useSound();
  const [feedback, setFeedback] = useState<string | null>(null);

  const refillMutation = useMutation({
    mutationFn: () => refillHearts(false),
    onSuccess: (data) => {
      playCorrect();
      setFeedback(`Hearts refilled to ${data.hearts}/${data.max_hearts}!`);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
    },
    onError: (err: Error) => {
      playHeartLost();
      setFeedback(err.message);
    },
  });

  const gems = path?.user_stats.gems ?? 0;
  const hearts = path?.user_stats.hearts ?? 0;
  const maxHearts = path?.user_stats.max_hearts ?? 5;
  const heartsFull = hearts >= maxHearts;
  const canAfford = gems >= REFILL_COST;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <LiveUserProgress />
        <LiveQuests />

        {/* Gem balance card */}
        <div className="rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-4 space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Image src="/points.svg" width={28} height={28} alt="Gems" />
            <span className="text-2xl font-black text-sky-500">{gems}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-sub)]">
            Your gem balance
          </p>
          <p className="text-[11px] text-[var(--text-sub)]">
            Earn gems by completing lessons (+5) and unlocking achievements (+10).
          </p>
        </div>
      </StickyWrapper>

      <FeedWrapper>
        <div className="relative w-full flex flex-col gap-y-6">
          {feedback && (
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-700 animate-in fade-in">
              {feedback}
            </div>
          )}

          <h1 className="text-2xl font-black text-[var(--text-main)]">Shop</h1>

          {/* Hearts */}
          <h2 className="text-lg font-black text-[var(--text-main)]">Hearts</h2>
          <div className="flex items-center justify-between rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  Refill Hearts
                </h4>
                <p className="text-xs text-[var(--text-sub)]">
                  Get full hearts so you can worry less about making mistakes
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              className="text-xs uppercase font-black shrink-0 flex items-center gap-1.5"
              disabled={heartsFull || !canAfford || refillMutation.isPending}
              onClick={() => refillMutation.mutate()}
            >
              {heartsFull ? (
                "Full"
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {REFILL_COST}
                </>
              )}
            </Button>
          </div>
          {!heartsFull && !canAfford && (
            <p className="text-xs font-bold text-[var(--text-sub)] -mt-3 ml-2">
              You need {REFILL_COST - gems} more gems — complete lessons to earn them!
            </p>
          )}

          {/* Super Duolingo */}
          <h2 className="text-lg font-black text-[var(--text-main)]">Super Duolingo</h2>
          <Link
            href="/efficiency"
            className="flex items-center justify-between rounded-2xl border-2 border-[var(--border-color)] bg-gradient-to-r from-sky-500/10 to-purple-500/10 p-4 hover:border-sky-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">
                  Super Duolingo
                </h4>
                <p className="text-xs text-[var(--text-sub)]">
                  Unlimited hearts, no ads, and unlimited legendary lessons
                </p>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-purple-500">
              Try free
            </span>
          </Link>

          {/* Power-Ups (coming soon) */}
          <h2 className="text-lg font-black text-[var(--text-main)]">Power-Ups</h2>
          <div className="flex items-center justify-between rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-4 opacity-60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-2xl">
                🧊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[var(--text-main)]">
                    Streak Freeze
                  </h4>
                  <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Coming soon
                  </span>
                </div>
                <p className="text-xs text-[var(--text-sub)]">
                  Streak Freeze allows your streak to remain in place for one full day
                  of inactivity.
                </p>
              </div>
            </div>
            <Button disabled variant="default" className="text-xs uppercase font-black">
              Equipped
            </Button>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
