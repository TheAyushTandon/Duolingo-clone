"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchCourses, setActiveCourse } from "@/lib/api";
import { useLearningPath } from "@/hooks/useUserData";
import { COURSE_FLAGS } from "@/types";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { playClick, playCorrect } = useSound();
  const { data: path } = useLearningPath();
  const [switching, setSwitching] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    staleTime: 60_000,
  });

  const switchMutation = useMutation({
    mutationFn: (courseId: string) => setActiveCourse(courseId),
    onSuccess: (_data, courseId) => {
      playCorrect();
      setSwitching(null);
      queryClient.invalidateQueries({ queryKey: ["learningPath"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      void courseId;
      router.push("/learn");
    },
  });

  const activeCourseId = path?.course.id;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-din">
      {/* Header */}
      <header className="border-b-2 border-[var(--border-color)] bg-[var(--bg-sidebar)]">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-4">
          <Link
            href="/learn"
            prefetch
            className="rounded-xl p-2 text-[var(--text-sub)] transition-colors hover:bg-[var(--border-color)]/40"
            aria-label="Back to learn"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </Link>
          <h1 className="text-lg font-black uppercase tracking-wider text-[var(--text-main)]">
            My Courses
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        {isLoading &&
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-3xl border-2 border-[var(--border-color)] bg-[var(--bg-sidebar)] animate-pulse"
            />
          ))}

        {courses?.map((course) => {
          const isActive = course.id === activeCourseId;
          const isSwitching = switchMutation.isPending && switching === course.id;

          return (
            <button
              key={course.id}
              disabled={isActive || switchMutation.isPending}
              onClick={() => {
                playClick();
                setSwitching(course.id);
                switchMutation.mutate(course.id);
              }}
              className={`group flex w-full items-center gap-5 rounded-3xl border-2 p-5 text-left transition-all ${
                isActive
                  ? "border-[#58cc02] bg-[#58cc02]/5"
                  : "border-[var(--border-color)] bg-[var(--bg-sidebar)] hover:border-sky-300 hover:shadow-md active:translate-y-0.5"
              }`}
            >
              <Image
                src={COURSE_FLAGS[course.code] || "/fr.svg"}
                alt={course.title}
                width={64}
                height={48}
                className="rounded-lg border border-black/10 object-cover shrink-0 transition-transform group-hover:scale-105"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-[var(--text-main)]">
                  {course.title}
                </h2>
                <p className="text-sm font-semibold text-[var(--text-sub)]">
                  {course.description}
                </p>
              </div>
              {isActive ? (
                <span className="flex items-center gap-1.5 rounded-2xl border-2 border-[#58cc02] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#58cc02]">
                  <Check size={14} strokeWidth={3.5} /> Active
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                  {isSwitching ? "Switching..." : "Switch →"}
                </span>
              )}
            </button>
          );
        })}

        <p className="pt-4 text-center text-xs font-semibold text-[var(--text-sub)]">
          Your progress in each course is saved separately.
        </p>

        <div className="pt-6 text-center">
          <Link href="/register">
            <Button
              variant="primaryOutline"
              className="text-xs font-black uppercase tracking-wider"
            >
              Start a new course
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
