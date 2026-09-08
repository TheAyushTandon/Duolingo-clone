"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/stores/useLanguageStore";

interface SiteLanguage {
  name: string;
  flag: string;
}

const COLUMN_1_LANGUAGES: SiteLanguage[] = [
  { name: "العربية", flag: "/assets/flags/arabic.svg" },
  { name: "Čeština", flag: "/assets/flags/czech.svg" },
  { name: "Ελληνικά", flag: "/assets/flags/8db373482261397a3159d3f370eed2f3.svg" },
  { name: "Español", flag: "/assets/flags/spanish.svg" },
  { name: "हिंदी", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { name: "Bahasa Indonesia", flag: "/assets/flags/339c0413e542f19b234971d7740447e7.svg" },
  { name: "日本語", flag: "/assets/flags/japanese.svg" },
  { name: "Nederlands", flag: "/assets/flags/dutch.svg" },
  { name: "Polski", flag: "/assets/flags/f095084e6ec400e631d62c3d95fefaa2.svg" },
  { name: "Română", flag: "/assets/flags/357e13bb10cf86fc06552d563957e2e6.svg" },
  { name: "svenska", flag: "/assets/flags/f578430c9b7ab617c107893afbb501c0.svg" },
  { name: "తెలుగు", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { name: "Tagalog", flag: "/assets/flags/8cb302b44c183c1a8ec3b90caf90d922.svg" },
  { name: "Українською", flag: "/assets/flags/7c6e12bc57527843082f7f5bb77c9862.svg" },
  { name: "Tiếng Việt", flag: "/assets/flags/2b077d42185bc45d4896ed55f15c4fea.svg" },
];

const COLUMN_2_LANGUAGES: SiteLanguage[] = [
  { name: "বাংলা", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { name: "Deutsch", flag: "/assets/flags/german.svg" },
  { name: "English", flag: "/assets/flags/english.svg" },
  { name: "Français", flag: "/assets/flags/french.svg" },
  { name: "Magyar", flag: "/assets/flags/2ed8d0a73eab3c9cba0290e2b459684a.svg" },
  { name: "Italiano", flag: "/assets/flags/italian.svg" },
  { name: "한국어", flag: "/assets/flags/ec5835ac9f465ff3dad4b1b8725d4314.svg" },
  { name: "ਪੰਜਾਬੀ", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { name: "Português", flag: "/assets/flags/potuguese.svg" },
  { name: "Русский", flag: "/assets/flags/eadd7804652170c33814a89482f1f353.svg" },
  { name: "தமிழ்", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { name: "ภาษาไทย", flag: "/assets/flags/thai.svg" },
  { name: "Türkçe", flag: "/assets/flags/bc80a9518cd6d5af6ae14e8b22b8a1f4.svg" },
  { name: "اُردُو", flag: "/assets/flags/urdu.svg" },
  { name: "中文", flag: "/assets/flags/9905aa3a86fcb9e351b0b3bfaf04d8b9.svg" },
];

interface LandingHeaderProps {
  onOpenAuth?: (mode: "login" | "register") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps = {}) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdown cleanly on mobile and desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleLanguageClick = (langName: string) => {
    if (langName === "English") {
      setLanguage("en");
      setIsOpen(false);
    } else if (langName === "हिंदी") {
      setLanguage("hi");
      setIsOpen(false);
    } else {
      setShowError(true);
      setIsOpen(false);
    }
  };

  const siteLanguageLabel =
    language === "hi" ? "साइट भाषा: हिंदी" : "SITE LANGUAGE: ENGLISH";

  return (
    <>
      {/* Placeholder to prevent layout shift since header is fixed */}
      <div className="h-18 w-full shrink-0" />
      
      <header
        className={`fixed top-0 left-0 z-50 w-full bg-white/95 backdrop-blur-xs transition-all duration-200 ${
          isScrolled ? "border-b border-[#E5E5E5] shadow-xs" : "border-b border-transparent"
        }`}
      >
      <div
        className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between transition-all duration-300 ease-in-out select-none relative"
      >
        {/* Duolingo Brand Logo */}
        <Link href="/" className="flex items-center group transition-all duration-300 ease-in-out shrink-0">
          <img
            src="/duolingo.svg"
            alt="Duolingo"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain group-hover:brightness-105 transition-all"
          />
        </Link>

        {/* Right Action: Switches between Site Language trigger and GET STARTED (when scrolled) */}
        {isScrolled ? (
          onOpenAuth ? (
            <button
              onClick={() => onOpenAuth("register")}
              className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-2xl bg-[#58CC02] text-white font-black text-[12px] sm:text-[13px] uppercase tracking-wider shadow-[0_3px_0_#46A302] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0 animate-in fade-in duration-200"
            >
              {t("GET STARTED")}
            </button>
          ) : (
            <Link
              href="/register"
              className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-2xl bg-[#58CC02] text-white font-black text-[12px] sm:text-[13px] uppercase tracking-wider shadow-[0_3px_0_#46A302] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0 animate-in fade-in duration-200"
            >
              {t("GET STARTED")}
            </Link>
          )
        ) : (
          <div
            ref={dropdownRef}
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 sm:gap-2 py-2 px-2 rounded-xl hover:bg-slate-100/80 text-[11px] sm:text-[13px] font-black tracking-wider uppercase text-[#777777] hover:text-[#4B4B4B] transition-colors focus:outline-none cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Select Site Language"
            >
              <span>{siteLanguageLabel}</span>
              <ChevronDown
                size={16}
                strokeWidth={2.8}
                className={`text-[#777777] transition-transform duration-200 shrink-0 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* The 2-Column Languages Popover Menu */}
            {isOpen && (
              <div className="absolute right-0 top-full pt-2 z-50 w-[calc(100vw-32px)] sm:w-[390px] max-w-[390px]">
                <div className="relative w-full bg-white rounded-[20px] border-2 border-[#E5E5E5] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-4 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto transition-all animate-in fade-in zoom-in-95 duration-150">
                  {/* Top Pointer Speech Arrow */}
                  <div className="absolute -top-[7px] right-[18px] w-3 h-3 bg-white border-l-2 border-t-2 border-[#E5E5E5] rotate-45 z-10 hidden sm:block" />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 select-none">
                    {/* Column 1 */}
                    <div className="flex flex-col space-y-0.5">
                      {COLUMN_1_LANGUAGES.map((item) => {
                        const isSelected =
                          (item.name === "हिंदी" && language === "hi") ||
                          (item.name === "English" && language === "en");
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleLanguageClick(item.name)}
                            className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-colors text-left cursor-pointer ${
                              isSelected
                                ? "bg-[#EBF7FF] text-[#1CB0F6]"
                                : "text-[#4B4B4B] hover:bg-[#F1F7FB] hover:text-[#1CB0F6]"
                            }`}
                          >
                            <img
                              src={item.flag}
                              alt={item.name}
                              className="w-[22px] h-[16px] object-cover rounded-[3px] border border-black/10 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <span className="truncate">{item.name}</span>
                            {isSelected && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1CB0F6] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col space-y-0.5">
                      {COLUMN_2_LANGUAGES.map((item) => {
                        const isSelected =
                          (item.name === "हिंदी" && language === "hi") ||
                          (item.name === "English" && language === "en");
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleLanguageClick(item.name)}
                            className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-colors text-left cursor-pointer ${
                              isSelected
                                ? "bg-[#EBF7FF] text-[#1CB0F6]"
                                : "text-[#4B4B4B] hover:bg-[#F1F7FB] hover:text-[#1CB0F6]"
                            }`}
                          >
                            <img
                              src={item.flag}
                              alt={item.name}
                              className="w-[22px] h-[16px] object-cover rounded-[3px] border border-black/10 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <span className="truncate">{item.name}</span>
                            {isSelected && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1CB0F6] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
    
    {/* Error Toast */}
    {showError && (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-[#FF4B4B] text-white rounded-2xl shadow-[0_4px_16px_rgba(255,75,75,0.4)] font-bold text-sm sm:text-base tracking-wide max-w-[90%] w-max text-center animate-in slide-in-from-bottom-5 fade-in duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{t("Only English and Hindi are available in this section.")}</span>
      </div>
    )}
    </>
  );
}
