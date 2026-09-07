"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Trophy, 
  Target, 
  Store, 
  User 
} from "lucide-react";
import { useSound } from "@/hooks/useSound";

const NAV_ITEMS = [
  { label: "LEARN", href: "/learn", icon: Compass },
  { label: "LEAGUES", href: "/leaderboard", icon: Trophy },
  { label: "QUESTS", href: "/quests", icon: Target },
  { label: "SHOP", href: "/shop", icon: Store },
  { label: "PROFILE", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { playClick } = useSound();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-slate-200 flex items-center justify-around px-2 z-40 select-none">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/learn" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={playClick}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              isActive
                ? "bg-[#ddf4ff] text-[#1cb0f6]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={24} className={isActive ? "text-[#1cb0f6]" : "text-slate-400"} />
          </Link>
        );
      })}
    </nav>
  );
}
