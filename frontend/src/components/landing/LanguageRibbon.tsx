"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LanguageRibbonItem {
  id: string;
  name: string;
  flag: string;
}

const LANGUAGES: LanguageRibbonItem[] = [
  { id: "en", name: "ENGLISH", flag: "/assets/flags/english.svg" },
  { id: "chess", name: "CHESS", flag: "/assets/flags/chess.svg" },
  { id: "math", name: "MATH", flag: "/assets/flags/math.svg" },
  { id: "es", name: "SPANISH", flag: "/assets/flags/spanish.svg" },
  { id: "fr", name: "FRENCH", flag: "/assets/flags/french.svg" },
  { id: "de", name: "GERMAN", flag: "/assets/flags/german.svg" },
  { id: "it", name: "ITALIAN", flag: "/assets/flags/italian.svg" },
  { id: "pt", name: "PORTUGUESE", flag: "/assets/flags/potuguese.svg" },
  { id: "nl", name: "DUTCH", flag: "/assets/flags/dutch.svg" },
  { id: "ja", name: "JAPANESE", flag: "/assets/flags/japanese.svg" },
  { id: "ar", name: "ARABIC", flag: "/assets/flags/arabic.svg" },
  { id: "cs", name: "CZECH", flag: "/assets/flags/czech.svg" },
  { id: "cy", name: "WELSH", flag: "/assets/flags/welsh.svg" },
  { id: "da", name: "DANISH", flag: "/assets/flags/6af84a7cb8e99ea8a567c2b9c55b9926.svg" },
  { id: "el", name: "GREEK", flag: "/assets/flags/8db373482261397a3159d3f370eed2f3.svg" },
  { id: "eo", name: "ESPERANTO", flag: "/assets/flags/6de7e4731b2a82a6458268e1a3d67ce4.svg" },
  { id: "fi", name: "FINNISH", flag: "/assets/flags/b4d0e4f6451f504e1441eb93efdbea5e.svg" },
  { id: "ga", name: "IRISH", flag: "/assets/flags/ef0bfb96037b127473bd7bcbfde1a6ed.svg" },
  { id: "gd", name: "SCOTTISH GAELIC", flag: "/assets/flags/09eba3135efe8fe93a4662dba813b921.svg" },
  { id: "he", name: "HEBREW", flag: "/assets/flags/f818f545a703ddaa046ca8786e781742.svg" },
  { id: "hi", name: "HINDI", flag: "/assets/flags/73837fa39dbf1bcc4c95a17a58ed0ffb.svg" },
  { id: "ht", name: "HAITIAN CREOLE", flag: "/assets/flags/55bad151fa6a8d9e2376fc9697c671c8.svg" },
  { id: "hu", name: "HUNGARIAN", flag: "/assets/flags/2ed8d0a73eab3c9cba0290e2b459684a.svg" },
  { id: "hv", name: "HIGH VALYRIAN", flag: "/assets/flags/f7cee6cc09270371b097129faf792c2a.svg" },
  { id: "haw", name: "HAWAIIAN", flag: "/assets/flags/312e21f793c555787d01a45e20ee8191.svg" },
  { id: "id", name: "INDONESIAN", flag: "/assets/flags/339c0413e542f19b234971d7740447e7.svg" },
  { id: "ko", name: "KOREAN", flag: "/assets/flags/ec5835ac9f465ff3dad4b1b8725d4314.svg" },
  { id: "la", name: "LATIN", flag: "/assets/flags/bbc8ad0cfe2596d5193376ebdc3e969c.svg" },
  { id: "no", name: "NORWEGIAN (BOKMÅL)", flag: "/assets/flags/90b37d97edc66e830dc2286279548f67.svg" },
  { id: "nv", name: "NAVAJO", flag: "/assets/flags/76d654213a8282b0ebc25b4f535ee003.svg" },
  { id: "pl", name: "POLISH", flag: "/assets/flags/f095084e6ec400e631d62c3d95fefaa2.svg" },
  { id: "ro", name: "ROMANIAN", flag: "/assets/flags/357e13bb10cf86fc06552d563957e2e6.svg" },
  { id: "ru", name: "RUSSIAN", flag: "/assets/flags/eadd7804652170c33814a89482f1f353.svg" },
  { id: "sv", name: "SWEDISH", flag: "/assets/flags/f578430c9b7ab617c107893afbb501c0.svg" },
  { id: "sw", name: "SWAHILI", flag: "/assets/flags/335311988405b4354e1b6ae9037c02db.svg" },
  { id: "tlh", name: "KLINGON", flag: "/assets/flags/2880099b038848abbfd11104097953ad.svg" },
  { id: "tr", name: "TURKISH", flag: "/assets/flags/bc80a9518cd6d5af6ae14e8b22b8a1f4.svg" },
  { id: "uk", name: "UKRAINIAN", flag: "/assets/flags/7c6e12bc57527843082f7f5bb77c9862.svg" },
  { id: "vi", name: "VIETNAMESE", flag: "/assets/flags/2b077d42185bc45d4896ed55f15c4fea.svg" },
  { id: "yi", name: "YIDDISH", flag: "/assets/flags/f818f545a703ddaa046ca8786e781742.svg" },
  { id: "zh", name: "CHINESE (SIMPLIFIED)", flag: "/assets/flags/9905aa3a86fcb9e351b0b3bfaf04d8b9.svg" },
  { id: "zu", name: "ZULU", flag: "/assets/flags/112e1531d0ac198a9424bd1b0a7166e6.svg" },
];

export function LanguageRibbon() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const firstChild = scrollRef.current.firstElementChild as HTMLElement | null;
      const oneItemStep = firstChild ? firstChild.getBoundingClientRect().width + 24 : 150;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -oneItemStep : oneItemStep,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden md:block w-full border-t border-[#E5E5E5] bg-white py-4 select-none relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3">
        {/* Left Arrow */}
        <button
          onClick={() => handleScroll("left")}
          className="p-2 rounded-xl text-[#AFAFAF] hover:text-[#4B4B4B] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>

        {/* Scrollable Language Items - 8 visible at once, larger size, no hover animation */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {LANGUAGES.map((lang) => (
            <Link
              key={lang.id}
              href="/learn"
              className="flex items-center justify-center gap-3 shrink-0 w-[calc((100%-7*1.5rem)/8)] min-w-[125px] font-black text-[13px] text-[#777777] hover:text-[#4B4B4B] tracking-wider uppercase whitespace-nowrap transition-colors"
            >
              <img
                src={lang.flag}
                alt={lang.name}
                className="w-[34px] h-[25px] object-cover rounded-[4px] border border-black/10 shrink-0 shadow-2xs"
              />
              <span className="truncate">{lang.name}</span>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => handleScroll("right")}
          className="p-2 rounded-xl text-[#AFAFAF] hover:text-[#4B4B4B] hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
