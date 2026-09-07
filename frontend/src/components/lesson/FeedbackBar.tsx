"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface FeedbackBarProps {
  status: "idle" | "correct" | "incorrect";
  solutionText?: string;
  isCheckDisabled: boolean;
  onCheck: () => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export function FeedbackBar({
  status,
  solutionText,
  isCheckDisabled,
  onCheck,
  onContinue,
  isSubmitting = false,
}: FeedbackBarProps) {
  const { playClick } = useSound();

  // Keyboard shortcut: Press Enter to submit check or continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "idle") {
          if (!isCheckDisabled && !isSubmitting) {
            playClick();
            onCheck();
          }
        } else {
          playClick();
          onContinue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isCheckDisabled, isSubmitting, onCheck, onContinue, playClick]);

  if (status === "correct") {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-[#d7ffb8] border-t-2 border-[#b8f28b] py-6 px-4 sm:px-8 z-40 animate-in slide-in-from-bottom duration-200 select-none">
        <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[#58a700]">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <CheckCircle2 size={36} className="text-[#58a700] fill-[#58a700] text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-none">
                Nicely done!
              </h3>
              <p className="text-xs font-bold text-[#58a700]/80 mt-1">
                You got it right. Keep going!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onContinue();
            }}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>CONTINUE</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
    );
  }

  if (status === "incorrect") {
    return (
      <footer className="fixed bottom-0 left-0 right-0 bg-[#ffdfe0] border-t-2 border-[#ffb8b9] py-6 px-4 sm:px-8 z-40 animate-in slide-in-from-bottom duration-200 select-none">
        <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[#ea2b2b]">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <XCircle size={36} className="text-[#ea2b2b] fill-[#ea2b2b] text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-none">
                Correct solution:
              </h3>
              <p className="text-sm font-extrabold text-[#ea2b2b] mt-1">
                {solutionText || "Please review the correct answer"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onContinue();
            }}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-[#ff4b4b] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#d32f2f] hover:bg-[#e03838] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>GOT IT</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
    );
  }

  // Idle state
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 py-6 px-4 sm:px-8 z-40 select-none">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="hidden sm:block text-xs font-bold text-slate-400">
          Tip: Press <kbd className="px-2 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">Enter ↵</kbd> to submit
        </div>

        <button
          onClick={() => {
            if (!isCheckDisabled && !isSubmitting) {
              playClick();
              onCheck();
            }
          }}
          disabled={isCheckDisabled || isSubmitting}
          className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
            isCheckDisabled || isSubmitting
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#58cc02] text-white shadow-[0_4px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none"
          }`}
        >
          {isSubmitting ? "CHECKING..." : "CHECK"}
        </button>
      </div>
    </footer>
  );
}
