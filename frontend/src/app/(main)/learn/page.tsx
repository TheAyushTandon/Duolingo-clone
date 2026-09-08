"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LiveUserProgress } from "@/components/live-user-progress";
import { LearningPath } from "@/components/learn/LearningPath";
import { LiveQuests } from "@/components/live-quests";
import { Promo } from "@/components/promo";

import { useLearningPath } from "@/hooks/useUserData";

import { Header } from "./header";
import { LoadingLearn } from "./loading";

const LearnPage = () => {
  const { data, isLoading, isError } = useLearningPath();

  if (isLoading) {
    return <LoadingLearn />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-4 h-14 w-14 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-black text-2xl">
          !
        </div>
        <h3 className="text-xl font-black text-[var(--text-main)] mb-2">
          Learning path unavailable
        </h3>
        <p className="mb-6 text-sm font-semibold text-[var(--text-sub)] max-w-sm">
          Make sure the backend is running at{" "}
          <code className="rounded bg-[var(--border-color)] px-1">127.0.0.1:8000</code>{" "}
          and seeded.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <LiveUserProgress />
        <Promo />
        <LiveQuests />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={data.course.title} />
        <LearningPath units={data.units} />
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
