"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  Trophy, 
  Target, 
  Store, 
  User, 
  Volume2, 
  VolumeX, 
  Wrench 
} from "lucide-react";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useSound } from "@/hooks/useSound";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "LEARN", href: "/learn", icon: Compass, color: "text-[#58cc02]" },
  { label: "LEADERBOARDS", href: "/leaderboard", icon: Trophy, color: "text-[#ffc800]" },
  { label: "QUESTS", href: "/quests", icon: Target, color: "text-[#ff9600]" },
  { label: "SHOP", href: "/shop", icon: Store, color: "text-[#1cb0f6]" },
  { label: "PROFILE", href: "/profile", icon: User, color: "text-[#ce82ff]" },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const { soundEnabled, toggleSound, toggleDevTools } = usePreferencesStore();
  const { playClick } = useSound();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r-2 border-slate-200 bg-white px-4 py-6 z-40 select-none">
      {/* Brand Header */}
      <div className="px-4 mb-8">
        <Link href="/learn" className="flex items-center gap-2 group" onClick={playClick}>
          <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 100 100" fill="none">
            <path
              d="M50 8C27 8 10 26 10 50c0 14 6 26 16 34l-4 8 11-4c5 2 11 3 17 3 23 0 40-18 40-41S73 8 50 8z"
              fill="#58CC02"
            />
            <ellipse cx="38" cy="46" rx="9" ry="11" fill="#FFFFFF" />
            <ellipse cx="62" cy="46" rx="9" ry="11" fill="#FFFFFF" />
            <circle cx="39" cy="47" r="5" fill="#4B4B4B" />
            <circle cx="61" cy="47" r="5" fill="#4B4B4B" />
            <polygon points="50,54 44,63 56,63" fill="#FF9600" />
          </svg>
          <span className="text-3xl font-black text-[#58cc02] tracking-tight">duolingo</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/learn" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playClick}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-black text-sm tracking-wider uppercase transition-all duration-150 border-2 ${
                isActive
                  ? "bg-[#ddf4ff] border-[#84d8ff] text-[#1cb0f6]"
                  : "border-transparent text-slate-500 hover:bg-slate-100 hover:border-slate-200"
              }`}
            >
              <Icon
                size={26}
                className={isActive ? "text-[#1cb0f6]" : "text-slate-400 group-hover:text-slate-600"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Utility Controls */}
      <div className="pt-4 border-t-2 border-slate-100 space-y-2">
        <div className="flex items-center justify-between px-2">
          <ThemeToggle />
          <button
            onClick={() => {
              toggleSound();
              playClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs text-slate-500 hover:bg-slate-100 transition-colors"
            title={soundEnabled ? "Mute audio effects" : "Unmute audio effects"}
          >
            {soundEnabled ? <Volume2 size={18} className="text-[#58cc02]" /> : <VolumeX size={18} className="text-slate-400" />}
            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-black ${soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {soundEnabled ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Developer Sandbox Drawer Trigger */}
        <button
          onClick={() => {
            toggleDevTools();
            playClick();
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
        >
          <Wrench size={18} className="text-amber-500" />
          <span>DEV SIMULATOR</span>
        </button>
      </div>
    </aside>
  );
}
