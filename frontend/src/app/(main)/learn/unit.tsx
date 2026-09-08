import { LessonButton, LessonType } from "./lesson-button";
import { UnitBanner } from "./unit-banner";

export type LessonItem = {
  id: number;
  completed: boolean;
  type?: LessonType;
  showMascot?: boolean;
};

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  milestoneTitle?: string;
  lessons: LessonItem[];
  activeLesson:
    | {
        id: number;
      }
    | undefined;
  activeLessonPercentage: number;
};

export const Unit = ({
  title,
  description,
  milestoneTitle = "Greet new people",
  lessons,
  activeLesson,
  activeLessonPercentage,
}: UnitProps) => {
  return (
    <>
      <UnitBanner title={title} description={description} />

      <div className="relative flex flex-col items-center">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.id === activeLesson?.id;
          const isLocked = !lesson.completed && !isCurrent;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={i}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
              type={lesson.type || "star"}
              showMascot={lesson.showMascot}
            />
          );
        })}
      </div>

      {milestoneTitle && (
        <div className="mt-14 mb-8 flex items-center justify-center gap-4">
          <div className="h-[2px] w-24 bg-[var(--border-color)]" />
          <span className="text-sm font-black text-[var(--text-sub)] uppercase tracking-wider">
            {milestoneTitle}
          </span>
          <div className="h-[2px] w-24 bg-[var(--border-color)]" />
        </div>
      )}
    </>
  );
};
