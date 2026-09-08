"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-3 rounded-full transition-colors flex items-center justify-center shrink-0 ${
        theme === "dark"
          ? "text-[#FFC800] hover:bg-[#FFC800]/10"
          : "text-[#AFAFAF] hover:bg-[#E5E5E5]"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={24} strokeWidth={2.5} />
      ) : (
        <Moon size={24} strokeWidth={2.5} />
      )}
    </button>
  );
};
