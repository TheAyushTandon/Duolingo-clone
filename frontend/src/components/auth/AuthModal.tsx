"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { loginUser, registerUser } from "@/lib/api";
import { useSound } from "@/hooks/useSound";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  initialMode = "register",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with prop changes when opened
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setUsername("");
      setPassword("");
    }
  }, [isOpen, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      playIncorrect();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        await registerUser(username.trim(), password);
      } else {
        await loginUser(username.trim(), password);
      }

      playCorrect();
      // Clear cached queries so the UI loads fresh user stats
      await queryClient.invalidateQueries();
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        if (mode === "register") {
          router.push("/register");
        } else {
          router.push("/learn");
        }
      }
    } catch (err: unknown) {
      playIncorrect();
      const message =
        err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    playClick();
    setMode(newMode);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            className="relative w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E5E5E5] font-din z-10 select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="absolute top-5 right-5 p-2 text-[#AFAFAF] hover:text-[#4B4B4B] hover:bg-[#F7F7F7] rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#4B4B4B] tracking-tight">
                {mode === "register" ? "Create your profile" : "Log in"}
              </h2>
              <p className="text-sm font-bold text-[#777777] mt-1">
                {mode === "register"
                  ? "Enter a username and password to start learning"
                  : "Welcome back! Enter your credentials"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-[#FFF0F0] border-2 border-[#FFD0D0] text-[#FF4B4B] rounded-2xl text-sm font-bold animate-in fade-in duration-150">
                <AlertCircle size={18} className="shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#777777] mb-1.5 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. duofan123"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F7] text-[#4B4B4B] font-bold text-base placeholder-[#AFAFAF] focus:bg-white focus:border-[#1CB0F6] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#777777] mb-1.5 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F7] text-[#4B4B4B] font-bold text-base placeholder-[#AFAFAF] focus:bg-white focus:border-[#1CB0F6] focus:outline-none transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#58CC02] text-white font-black text-base uppercase tracking-wider shadow-[0_4px_0_#46A302] hover:brightness-105 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : mode === "register" ? (
                  "CREATE ACCOUNT"
                ) : (
                  "LOG IN"
                )}
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="mt-6 pt-5 border-t border-[#E5E5E5] text-center">
              {mode === "register" ? (
                <p className="text-sm font-bold text-[#777777]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#1CB0F6] hover:underline font-black uppercase tracking-wide cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p className="text-sm font-bold text-[#777777]">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-[#1CB0F6] hover:underline font-black uppercase tracking-wide cursor-pointer"
                  >
                    Create Profile
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
