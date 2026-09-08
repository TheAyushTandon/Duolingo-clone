"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import StepExperienceLevel from "./StepExperienceLevel";
import StepAchievement from "./StepAchievement";
import StepDailyGoal from "./StepDailyGoal";
import StepPlacement from "./StepPlacement";
import StepConfirmation from "./StepConfirmation";
import PlacementTest from "./PlacementTest";
import { setActiveCourse } from "@/lib/api";

interface OnboardingWizardProps {
  courseName: string;
  courseId: string;
  onBackToCourses: () => void;
}

export default function OnboardingWizard({ courseName, courseId, onBackToCourses }: OnboardingWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isFinishing, setIsFinishing] = useState(false);

  // State to hold answers
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState<string | null>("15"); // default 15 min
  const [placement, setPlacement] = useState<string | null>(null);

  const [showPlacementTest, setShowPlacementTest] = useState(false);

  // Persist the course selection so /learn shows the chosen course.
  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      await setActiveCourse(courseId);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (err) {
      console.error("Failed to set active course:", err);
    } finally {
      router.push("/learn");
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBackToCourses();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleContinue = () => {
    if (step === 4) {
      if (placement === "find_level") {
        setShowPlacementTest(true);
      } else {
        // Start from scratch -> persist course choice, then the main path
        void finishOnboarding();
      }
      return;
    }

    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const isContinueEnabled = () => {
    if (step === 1) return experienceLevel !== null;
    if (step === 2) return true;
    if (step === 3) return dailyGoal !== null;
    if (step === 4) return placement !== null;
    return false;
  };

  if (showPlacementTest) {
    return (
      <PlacementTest
        courseName={courseName}
        courseId={courseId}
        onClose={() => setShowPlacementTest(false)}
        onComplete={() => void finishOnboarding()}
      />
    );
  }

  // Progress percentage (0 to 100)
  const progressPercentage = ((step - 1) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-[#131F24] text-white flex flex-col font-din z-50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center px-4 md:px-8 py-4 shrink-0">
        <button
          onClick={handleBack}
          className="text-[#4b5563] hover:text-[#9ca3af] transition-colors p-2"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="flex-1 ml-4 md:ml-6">
          <div className="h-4 w-full bg-[#37464F] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#58CC02] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[600px] px-6 py-8 flex flex-col items-center flex-1"
          >
            {step === 1 && (
              <StepExperienceLevel
                courseName={courseName}
                selected={experienceLevel}
                onSelect={setExperienceLevel}
              />
            )}
            {step === 2 && <StepAchievement />}
            {step === 3 && (
              <StepDailyGoal selected={dailyGoal} onSelect={setDailyGoal} />
            )}
            {step === 4 && (
              <StepPlacement
                courseName={courseName}
                selected={placement}
                onSelect={setPlacement}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Footer */}
      <div className="border-t-2 border-[#37464F] bg-[#131F24] p-4 shrink-0">
        <div className="max-w-[600px] mx-auto flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!isContinueEnabled() || isFinishing}
            className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all
              ${
                isContinueEnabled() && !isFinishing
                  ? "bg-[#58CC02] text-white hover:bg-[#46A302] active:translate-y-1 shadow-[0_4px_0_#58A700] active:shadow-[0_0px_0_#58A700]"
                  : "bg-[#37464F] text-[#52656D] cursor-not-allowed"
              }
            `}
          >
            {isFinishing ? "Setting up..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
