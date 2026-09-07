"use client";

import React from "react";
import Link from "next/link";

export default function LandingFooter() {
  const sections = [
    {
      title: "About us",
      links: ["Courses", "Mission", "Approach", "Efficacy", "Careers", "Brand Guidelines"],
    },
    {
      title: "Products",
      links: ["Duolingo", "Duolingo for Schools", "Duolingo English Test", "Duolingo ABC", "Duolingo Math"],
    },
    {
      title: "Apps",
      links: ["Duolingo for Android", "Duolingo for iOS"],
    },
    {
      title: "Help & Support",
      links: ["Duolingo FAQs", "Schools FAQs", "Community Guidelines", "Security"],
    },
    {
      title: "Terms & Privacy",
      links: ["Community Guidelines", "Terms of Service", "Privacy Policy", "Respecting Your Privacy"],
    },
  ];

  return (
    <footer className="w-full bg-[#58CC02] text-white pt-16 pb-12">
      <div className="max-w-[1040px] mx-auto px-6">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
          {sections.map((sec) => (
            <div key={sec.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white/90">
                {sec.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {sec.links.map((lnk) => (
                  <li key={lnk}>
                    <Link
                      href="/learn"
                      className="text-xs sm:text-sm font-bold text-white/80 hover:text-white hover:underline transition-colors"
                    >
                      {lnk}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom divider & language list */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-white/70">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span>Site language:</span>
            <span className="text-white underline cursor-pointer">English</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Español</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Français</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Deutsch</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Italiano</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">日本語</span>
          </div>

          <div>
            © {new Date().getFullYear()} Duolingo Clone • Crafted with 💚 by Ayush
          </div>
        </div>
      </div>
    </footer>
  );
}
