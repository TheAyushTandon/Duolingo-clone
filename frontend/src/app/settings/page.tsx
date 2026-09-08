"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Volume2,
  Lock,
  Mic,
  Sparkles,
  Users,
  LogOut,
  Check,
  Globe,
} from "lucide-react";

import { updateSettings } from "@/lib/api";
import { useProfile } from "@/hooks/useUserData";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "@/stores/useLanguageStore";

const GOAL_OPTIONS = [
  { xp: 20, label: "Casual", hint: "5 min / day" },
  { xp: 40, label: "Regular", hint: "10 min / day" },
  { xp: 60, label: "Serious", hint: "15 min / day" },
  { xp: 80, label: "Intense", hint: "20 min / day" },
];

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { playClick, playCorrect } = useSound();
  const { soundEnabled, toggleSound } = usePreferencesStore();
  const { language, setLanguage, t } = useTranslation();
  const [feedback, setFeedback] = useState<string | null>(null);

  const goalMutation = useMutation({
    mutationFn: (dailyGoalXp: number) => updateSettings({ daily_goal_xp: dailyGoalXp }),
    onSuccess: () => {
      playCorrect();
      setFeedback(t("Daily goal saved!"));
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
    },
    onError: (err: Error) => setFeedback(err.message),
  });

  const currentGoal = profile?.daily_goal_xp ?? 50;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-din">
      {/* Header */}
      <header className="border-b-2 border-[var(--border-color)] bg-[var(--bg-sidebar)]">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-4">
          <Link
            href="/learn"
            prefetch
            className="rounded-xl p-2 text-[var(--text-sub)] transition-colors hover:bg-[var(--border-color)]/40"
            aria-label="Back to learn"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-wider text-[var(--text-main)]">
            {t("Settings")}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8 pb-24">
        {feedback && (
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Site Language Switcher */}
        <section className="rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Globe size={22} className="text-[#1CB0F6]" />
            <h2 className="text-lg font-black text-[var(--text-main)]">
              {t("Site Language")}
            </h2>
          </div>
          <p className="text-xs font-semibold text-[var(--text-sub)]">
            {t("Choose your preferred language for the Duolingo interface and lesson questions.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* English Card */}
            <button
              onClick={() => {
                playClick();
                setLanguage("en");
                setFeedback("Language updated to English!");
              }}
              className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                language === "en"
                  ? "border-[#1CB0F6] bg-[#1CB0F6]/10 shadow-[0_3px_0_#1899D6]"
                  : "border-[var(--border-color)] hover:border-[#1CB0F6]/40 bg-[var(--bg-main)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/flags/english.svg"
                  alt="English"
                  width={36}
                  height={26}
                  className="rounded-md border border-black/10 object-cover shadow-sm"
                />
                <div className="text-left">
                  <div className="font-black text-sm text-[var(--text-main)]">English</div>
                  <div className="text-xs font-semibold text-[var(--text-sub)]">English (US)</div>
                </div>
              </div>
              {language === "en" && (
                <div className="w-6 h-6 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white shadow-sm">
                  <Check size={16} strokeWidth={3.5} />
                </div>
              )}
            </button>

            {/* Hindi Card */}
            <button
              onClick={() => {
                playClick();
                setLanguage("hi");
                setFeedback("भाषा बदलकर हिंदी कर दी गई!");
              }}
              className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                language === "hi"
                  ? "border-[#1CB0F6] bg-[#1CB0F6]/10 shadow-[0_3px_0_#1899D6]"
                  : "border-[var(--border-color)] hover:border-[#1CB0F6]/40 bg-[var(--bg-main)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg"
                  alt="Hindi"
                  width={36}
                  height={26}
                  className="rounded-md border border-black/10 object-cover shadow-sm"
                />
                <div className="text-left">
                  <div className="font-black text-sm text-[var(--text-main)]">हिंदी</div>
                  <div className="text-xs font-semibold text-[var(--text-sub)]">Hindi</div>
                </div>
              </div>
              {language === "hi" && (
                <div className="w-6 h-6 rounded-full bg-[#1CB0F6] flex items-center justify-center text-white shadow-sm">
                  <Check size={16} strokeWidth={3.5} />
                </div>
              )}
            </button>
          </div>
        </section>

        {/* Daily goal */}
        <section className="rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-main)] flex items-center gap-2">
            🎯 {t("Daily goal")}
          </h2>
          <p className="text-xs font-semibold text-[var(--text-sub)]">
            {t("Set a daily XP goal to stay motivated and keep your streak going.")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((option) => {
              const isSelected = currentGoal === option.xp;
              const isSaving = goalMutation.isPending && goalMutation.variables === option.xp;

              return (
                <button
                  key={option.xp}
                  onClick={() => {
                    playClick();
                    goalMutation.mutate(option.xp);
                  }}
                  disabled={goalMutation.isPending}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#FF9600] bg-[#FF9600]/10"
                      : "border-[var(--border-color)] hover:border-[#FF9600]/50"
                  } ${isSaving ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[var(--text-main)]">
                      {t(option.label)}
                    </span>
                    {isSelected && (
                      <Check size={16} strokeWidth={3.5} className="text-[#FF9600]" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-sub)]">
                    {option.xp} XP · {t(option.hint)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sound & appearance */}
        <section className="rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-main)]">
            {t("Experience")}
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2
                size={20}
                className={soundEnabled ? "text-[#1cb0f6]" : "text-slate-400"}
              />
              <div>
                <div className="font-black text-sm text-[var(--text-main)]">
                  {t("Sound effects")}
                </div>
                <div className="text-xs font-semibold text-[var(--text-sub)]">
                  {t("Feedback sounds and narration")}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                toggleSound();
                playClick();
              }}
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Toggle sound effects"
              className={`relative h-8 w-14 rounded-full border-2 transition-colors ${
                soundEnabled
                  ? "bg-[#58cc02] border-[#46a302]"
                  : "bg-[var(--border-color)] border-[var(--border-color)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  soundEnabled ? "left-[26px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t-2 border-[var(--border-color)] pt-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌙</span>
              <div>
                <div className="font-black text-sm text-[var(--text-main)]">
                  {t("Dark mode")}
                </div>
                <div className="text-xs font-semibold text-[var(--text-sub)]">
                  {t("Toggle light/dark appearance")}
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Coming soon placeholders */}
        <section className="rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-sidebar)]/50 p-6 space-y-5">
          <h2 className="text-lg font-black text-[var(--text-sub)] uppercase tracking-wider text-xs">
            {t("Coming soon")}
          </h2>

          <PlaceholderRow
            icon={<Mic size={20} />}
            title={t("Speech recognition")}
            hint={t("Pronunciation exercises with real voice scoring")}
          />
          <PlaceholderRow
            icon={<Sparkles size={20} />}
            title={t("Super Duolingo")}
            hint={t("Unlimited hearts, no ads, and legendary lessons")}
          />
          <PlaceholderRow
            icon={<Users size={20} />}
            title={t("Friends & social")}
            hint={t("Follow friends and share leaderboards")}
          />
        </section>

        {/* Sign out */}
        <button
          onClick={() => {
            import("@/lib/api").then(({ logout }) => logout());
          }}
          className="w-full rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] py-3.5 font-black text-sm uppercase tracking-wider text-rose-500 transition-colors hover:border-rose-300 hover:bg-rose-500/5 flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          {t("Sign out")}
        </button>
      </main>
    </div>
  );
}

function PlaceholderRow({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 opacity-60">
      <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex items-center justify-center text-[var(--text-sub)] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-[var(--text-main)]">{title}</div>
        <div className="text-xs font-semibold text-[var(--text-sub)] truncate">{hint}</div>
      </div>
      <Lock size={16} className="text-[var(--text-sub)] shrink-0" />
    </div>
  );
}
