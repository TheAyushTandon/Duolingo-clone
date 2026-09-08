"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { cn } from "@/lib/utils";

export const MobileFooter = () => {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 w-full h-[80px] bg-[var(--bg-sidebar)] border-t-[2px] border-[var(--border-color)] flex items-center justify-around px-2 z-50">
      <NavItem href="/learn" iconSrc="/learn.svg" isActive={pathname === "/learn"} />
      <NavItem href="/leaderboard" iconSrc="/leaderboard.svg" isActive={pathname === "/leaderboard"} />
      <NavItem href="/quests" iconSrc="/quests.svg" isActive={pathname === "/quests"} />
      <NavItem href="/shop" iconSrc="/shop.svg" isActive={pathname === "/shop"} />
      <SettingsNavItem href="/settings" isActive={pathname === "/settings"} />
    </div>
  );
};

function SettingsNavItem({ href, isActive }: { href: string; isActive: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors">
      <div
        className={cn(
          "relative p-2 rounded-xl",
          isActive
            ? "bg-sky-500/15 border-2 border-sky-300"
            : "border-2 border-transparent"
        )}
      >
        <Settings size={28} className="text-[var(--text-sub)]" />
      </div>
    </Link>
  );
}

function NavItem({ href, iconSrc, isActive }: { href: string; iconSrc: string; isActive: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors">
      <div className={cn("relative p-2 rounded-xl", isActive ? "bg-sky-500/15 border-2 border-sky-300" : "border-2 border-transparent")}>
        <Image src={iconSrc} alt="nav icon" height={32} width={32} className="object-contain" />
      </div>
    </Link>
  );
}
