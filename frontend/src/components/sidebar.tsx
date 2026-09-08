"use client";

import Image from "next/image";
import Link from "next/link";
import { Wrench, LogOut, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";
import { ThemeToggle } from "./theme-toggle";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { logout } from "@/lib/api";

type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const toggleDevTools = usePreferencesStore((s) => s.toggleDevTools);

  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 px-4 lg:fixed lg:w-[256px] bg-[var(--bg-sidebar)] border-[var(--border-color)]",
        className
      )}
    >
      <Link href="/learn" prefetch>
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image src="/duolingo.svg" alt="Mascot" height={40} width={150} className="object-contain" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg" />
        <SidebarItem
          label="Leaderboard"
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
        />
        <SidebarItem label="Quests" href="/quests" iconSrc="/quests.svg" />
        <SidebarItem label="Shop" href="/shop" iconSrc="/shop.svg" />
        <SidebarItem label="Profile" href="/profile" iconSrc="/profile.svg" />
        <SidebarItem
          label="Settings"
          href="/settings"
          icon={<Settings size={26} className="text-[var(--text-sub)]" />}
        />
      </div>

      <div className="p-4 flex items-center justify-center gap-2">
        <ThemeToggle />
        {/* Dev sandbox: streak/day simulation, heart refill, progress reset */}
        <button
          onClick={toggleDevTools}
          aria-label="Open developer sandbox"
          title="Developer sandbox"
          className="rounded-xl border-2 border-[var(--border-color)] p-2 text-[var(--text-sub)] transition-colors hover:bg-[var(--border-color)]/40 hover:text-amber-500 cursor-pointer"
        >
          <Wrench size={18} />
        </button>
        <button
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="rounded-xl border-2 border-[var(--border-color)] p-2 text-[var(--text-sub)] transition-colors hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-300 cursor-pointer"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
