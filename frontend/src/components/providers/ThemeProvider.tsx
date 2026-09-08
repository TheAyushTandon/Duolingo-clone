"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only access localStorage in the browser
    const storedTheme = localStorage.getItem("duolingo-theme") as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Update HTML class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save to local storage
    localStorage.setItem("duolingo-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return fallback if used outside provider (e.g. during edge cases or testing)
    return {
      theme: "dark" as Theme,
      toggleTheme: () => {},
    };
  }
  return context;
}
