"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

interface CourseOption {
  id: string;
  name: string;
  icon: string;
  learners?: string;
  isSupported: boolean;
}

// Fallback when the backend is unreachable.
const FALLBACK_COURSES: CourseOption[] = [
  { id: "en", name: "English", icon: "/assets/flags/english.svg", learners: "20.5M learners", isSupported: true },
  { id: "fr", name: "French", icon: "/assets/flags/french.svg", learners: "22.8M learners", isSupported: true },
];

import SiteLanguageDropdown from "@/components/SiteLanguageDropdown";
import { fetchCourses } from "@/lib/api";
import { COURSE_FLAGS } from "@/types";
import { useTranslation } from "@/stores/useLanguageStore";

const LEARNER_COUNTS: Record<string, string> = {
  en: "20.5M learners",
  fr: "22.8M learners",
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showNotice, setShowNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("Only languages are supported as of this version of Duolingo.");
  const [step, setStep] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);

  // Real course catalog from the backend (falls back while loading/offline).
  const { data: apiCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 60_000,
  });

  const courses: CourseOption[] =
    apiCourses && apiCourses.length > 0
      ? apiCourses.map((c) => ({
          id: c.id,
          name: c.title,
          icon: COURSE_FLAGS[c.code] || "/fr.svg",
          learners: LEARNER_COUNTS[c.code],
          isSupported: true,
        }))
      : FALLBACK_COURSES;

  const handleCourseClick = (course: CourseOption) => {
    if (course.isSupported) {
      setSelectedCourse(course);
      setStep(1);
    } else {
      setNoticeMessage(t("Only languages are supported as of this version of Duolingo."));
      setShowNotice(true);
    }
  };

  const handleSiteLanguageError = () => {
    setNoticeMessage(t("Only English and Hindi are available in this section."));
    setShowNotice(true);
  };

  useEffect(() => {
    if (showNotice) {
      const timer = setTimeout(() => setShowNotice(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotice]);

  if (step > 0 && selectedCourse) {
    return (
      <OnboardingWizard
        courseName={selectedCourse.name}
        courseId={selectedCourse.id}
        onBackToCourses={() => setStep(0)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#4B4B4B] flex flex-col font-din selection:bg-[#d7ffb8]">
      {/* Header */}
      <header className="h-18 w-full border-b-2 border-[#E5E5E5] bg-white z-10 shrink-0">
        <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-12">
          <Link href="/" className="flex items-center group transition-all duration-300 ease-in-out">
            <img
              src="/duolingo.svg"
              alt="Duolingo"
              className="h-9 w-auto object-contain group-hover:brightness-105 transition-all"
            />
          </Link>
          <SiteLanguageDropdown onError={handleSiteLanguageError} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10 sm:py-16 flex flex-col items-center">
        <h1 
          className="font-din text-3xl sm:text-4xl text-center font-bold tracking-tight mb-8 sm:mb-12"
          style={{ color: '#4B4B4B' }}
        >
          {t("I want to learn...")}
        </h1>

        {/* Course Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-[900px]">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleCourseClick(course)}
              className={`flex flex-col items-center justify-center p-6 border-2 border-[#E5E5E5] rounded-2xl transition-colors cursor-pointer group select-none h-[180px] ${
                !course.isSupported 
                  ? "bg-[#F7F7F7] hover:bg-[#E5E5E5] active:bg-[#D5D5D5]" 
                  : "hover:bg-[#F7F7F7] active:bg-[#E5E5E5]"
              }`}
            >
              <img
                src={course.icon}
                alt={course.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-4 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-[17px] text-[#4B4B4B] text-center leading-tight mb-1">
                {course.name}
              </span>
              {course.learners && (
                <span className="text-[15px] text-[#777777] font-semibold">
                  {course.learners}
                </span>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Floating Notice Toast */}
      <AnimatePresence>
        {showNotice && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-[#FF4B4B] text-white rounded-2xl shadow-[0_4px_16px_rgba(255,75,75,0.4)] font-bold text-sm sm:text-base tracking-wide max-w-[90%] w-max text-center"
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{noticeMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
