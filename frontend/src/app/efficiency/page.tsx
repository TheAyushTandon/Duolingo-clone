"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function EfficiencyPage() {
  return (
    <div className="min-h-screen bg-white text-[#4B4B4B] flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-din text-3xl font-bold text-[#58CC02]">Duolingo Efficacy & Research</h1>
        <p className="text-[#777777] text-sm">
          Placeholder for Duolingo efficacy study and research details.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1CB0F6] hover:underline"
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
