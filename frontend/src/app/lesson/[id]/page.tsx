"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchLesson, 
  startLessonAttempt, 
  submitExerciseAnswer, 
  completeLessonAttempt, 
  abandonLessonAttempt 
} from "@/lib/api";
import { 
  LessonDetail, 
  PublicExercise, 
  ExerciseSubmitResponse, 
  LessonCompleteResponse 
} from "@/types";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { FeedbackBar } from "@/components/lesson/FeedbackBar";
import { QuitDialog } from "@/components/lesson/QuitDialog";
import { OutOfHeartsModal } from "@/components/lesson/OutOfHeartsModal";
import { LessonCompleteModal } from "@/components/lesson/LessonCompleteModal";
import { MultipleChoiceExercise } from "@/components/lesson/exercises/MultipleChoiceExercise";
import { WordBankExercise } from "@/components/lesson/exercises/WordBankExercise";
import { MatchPairsExercise } from "@/components/lesson/exercises/MatchPairsExercise";
import { FillBlankExercise } from "@/components/lesson/exercises/FillBlankExercise";
import { TypeAnswerExercise } from "@/components/lesson/exercises/TypeAnswerExercise";
import { useSound } from "@/hooks/useSound";
import { useLearningPath } from "@/hooks/useUserData";
import { AlertCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lessonId = params.id as string;

  const { playCorrect, playIncorrect, playHeartLost } = useSound();

  // Course narration locale for native-tongue speech.
  const { data: pathData } = useLearningPath();
  const speechLocale = pathData?.course.speech_locale || "es-ES";

  // Attempt session state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(pathData?.user_stats?.hearts ?? 5);
  const [heartLostTrigger, setHeartLostTrigger] = useState(false);
  const [isQuitOpen, setIsQuitOpen] = useState(false);
  const [isOutOfHeartsOpen, setIsOutOfHeartsOpen] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Synchronize hearts immediately whenever learning-path data updates
  useEffect(() => {
    if (pathData?.user_stats?.hearts !== undefined) {
      setHearts(pathData.user_stats.hearts);
    }
  }, [pathData?.user_stats?.hearts]);

  // Feedback bar state
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [solutionText, setSolutionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed lesson summary result
  const [completionData, setCompletionData] = useState<LessonCompleteResponse | null>(null);

  // Exercise input states
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [wbIndices, setWbIndices] = useState<number[]>([]);
  const [matchPairs, setMatchPairs] = useState<Array<{ left: string; right: string }>>([]);
  const [fillChoice, setFillChoice] = useState<string | null>(null);
  const [typeValue, setTypeValue] = useState<string>("");

  // 1. Fetch lesson details
  const { data: lesson, isLoading: isLessonLoading, isError: isLessonError } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchLesson(lessonId),
    staleTime: Infinity,
  });

  // 2. Initialize or resume lesson attempt
  useEffect(() => {
    let isMounted = true;
    async function initAttempt() {
      if (!lessonId) return;
      try {
        const res = await startLessonAttempt(lessonId);
        if (isMounted) {
          setAttemptId(res.attempt_id);
          // Backend index is the 1-based order of the next exercise
          // (0 = nothing answered yet); the exercises array is 0-based.
          const nextOrder = res.current_exercise_index || 0;
          setCurrentIndex(Math.max(0, nextOrder - 1));
          if (typeof res.hearts_remaining === "number") {
            setHearts(res.hearts_remaining);
          }
        }
      } catch (err) {
        console.error("Failed to start attempt:", err);
      }
    }
    initAttempt();
    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  const exercises = lesson?.exercises || [];
  const currentExercise = exercises[currentIndex] as PublicExercise | undefined;
  const totalExercises = exercises.length;

  // Reset inputs when moving to next exercise
  const resetInputStates = () => {
    setMcSelected(null);
    setWbIndices([]);
    setMatchPairs([]);
    setFillChoice(null);
    setTypeValue("");
    setFeedbackStatus("idle");
    setSolutionText("");
  };

  // Determine if check button should be enabled
  const isCheckDisabled = () => {
    if (!currentExercise || feedbackStatus !== "idle") return true;

    switch (currentExercise.type) {
      case "MULTIPLE_CHOICE":
        return mcSelected === null;
      case "WORD_BANK":
        return wbIndices.length === 0;
      case "MATCH": {
        const totalPairs = currentExercise.exercise_data.pairs_left?.length || 5;
        return matchPairs.length < totalPairs;
      }
      case "FILL_BLANK":
        return fillChoice === null;
      case "TYPE_ANSWER":
        return typeValue.trim().length === 0;
      default:
        return true;
    }
  };

  // Build the submission payload based on exercise type.
  // Backend contract: MC/FILL -> {selected_option}, WORD_BANK ->
  // {selected_words}, MATCH -> {pairs}, TYPE -> {answer}.
  const getSubmissionPayload = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case "MULTIPLE_CHOICE":
        return mcSelected === null ? null : { selected_option: mcSelected };
      case "WORD_BANK": {
        const wordBank = currentExercise.exercise_data.word_bank || [];
        const selectedWords = wbIndices.map((idx) => wordBank[idx]);
        return selectedWords.length ? { selected_words: selectedWords } : null;
      }
      case "MATCH":
        return matchPairs.length ? { pairs: matchPairs } : null;
      case "FILL_BLANK":
        return fillChoice === null ? null : { selected_option: fillChoice };
      case "TYPE_ANSWER":
        return typeValue.trim() ? { answer: typeValue.trim() } : null;
      default:
        return null;
    }
  };

  // Submit Answer handler
  const handleCheck = async () => {
    if (!attemptId || !currentExercise || isSubmitting) return;

    const payload = getSubmissionPayload();
    setIsSubmitting(true);

    try {
      const res: ExerciseSubmitResponse = await submitExerciseAnswer(
        attemptId,
        currentExercise.id,
        payload
      );

      setHearts(res.hearts_remaining);

      if (res.is_correct) {
        playCorrect();
        setFeedbackStatus("correct");
      } else {
        playIncorrect();
        playHeartLost();
        setHeartLostTrigger(true);
        setTimeout(() => setHeartLostTrigger(false), 800);
        setMistakesCount((prev) => prev + 1);
        setSolutionText(res.solution_text || "");
        setFeedbackStatus("incorrect");

        if (res.hearts_remaining <= 0) {
          setIsOutOfHeartsOpen(true);
        }
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Continue to next exercise or complete lesson
  const handleContinue = async () => {
    if (!attemptId) return;

    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetInputStates();
    } else {
      // Final exercise reached -> Complete the lesson atomically!
      try {
        const comp = await completeLessonAttempt(attemptId);
        queryClient.invalidateQueries({ queryKey: ["learningPath"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["activity"] });
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
        setCompletionData(comp);
      } catch (err) {
        console.error("Lesson completion error:", err);
      }
    }
  };

  // Quit confirmation
  const handleConfirmQuit = async () => {
    if (attemptId) {
      try {
        await abandonLessonAttempt(attemptId);
      } catch (e) {
        // Continue navigation even if abandon fails
      }
    }
    router.push("/learn");
  };

  if (isLessonLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin" />
        <span className="font-extrabold text-slate-500 text-sm tracking-wider uppercase">
          Loading lesson challenges...
        </span>
      </div>
    );
  }

  if (isLessonError || !lesson || exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">
          Unable to load lesson
        </h3>
        <p className="text-sm font-semibold text-slate-500 max-w-sm mb-6">
          Could not find lesson exercises or session is invalid.
        </p>
        <button
          onClick={() => router.push("/learn")}
          className="px-6 py-3 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider"
        >
          BACK TO LEARN
        </button>
      </div>
    );
  }

  // Calculate learner accuracy
  const totalSubmissions = totalExercises + mistakesCount;
  const accuracy = totalSubmissions > 0 
    ? (totalExercises / totalSubmissions) * 100 
    : 100;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between font-sans transition-colors duration-200">
        {/* Lesson Header */}
      <LessonHeader
        currentIndex={currentIndex}
        totalExercises={totalExercises}
        hearts={hearts}
        onQuitClick={() => setIsQuitOpen(true)}
        heartLostTrigger={heartLostTrigger}
      />

      {/* Main Interactive Exercise Canvas */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col justify-center pb-36">
        {currentExercise && (
          <div key={currentExercise.id} className="animate-in fade-in duration-200">
            {currentExercise.type === "MULTIPLE_CHOICE" && (
              <MultipleChoiceExercise
                prompt={currentExercise.prompt}
                options={currentExercise.exercise_data.options || []}
                selectedOptionId={mcSelected}
                onSelect={setMcSelected}
                disabled={feedbackStatus !== "idle"}
                locale={speechLocale}
              />
            )}

            {currentExercise.type === "WORD_BANK" && (
              <WordBankExercise
                prompt={currentExercise.prompt}
                sentence={currentExercise.exercise_data.sentence}
                wordBank={currentExercise.exercise_data.word_bank || []}
                selectedIndices={wbIndices}
                onToggleIndex={(idx) => {
                  setWbIndices((prev) =>
                    prev.includes(idx)
                      ? prev.filter((i) => i !== idx)
                      : [...prev, idx]
                  );
                }}
                disabled={feedbackStatus !== "idle"}
                locale={speechLocale}
                isSpeechOnly={Boolean(currentExercise.exercise_data.is_speech_only)}
              />
            )}

            {currentExercise.type === "MATCH" && (
              <MatchPairsExercise
                prompt={currentExercise.prompt}
                pairsLeft={currentExercise.exercise_data.pairs_left || []}
                pairsRight={currentExercise.exercise_data.pairs_right || []}
                matchedPairs={matchPairs}
                onMatchPairsChange={setMatchPairs}
                disabled={feedbackStatus !== "idle"}
                locale={speechLocale}
                pairsMap={currentExercise.exercise_data.pairs_map}
              />
            )}

            {currentExercise.type === "FILL_BLANK" && (
              <FillBlankExercise
                prompt={currentExercise.prompt}
                sentenceParts={currentExercise.exercise_data.sentence_parts || ["", ""]}
                choices={currentExercise.exercise_data.choices || []}
                selectedChoice={fillChoice}
                onSelectChoice={setFillChoice}
                disabled={feedbackStatus !== "idle"}
                locale={speechLocale}
              />
            )}

            {currentExercise.type === "TYPE_ANSWER" && (
              <TypeAnswerExercise
                prompt={currentExercise.prompt}
                promptSentence={currentExercise.exercise_data.prompt_sentence}
                hint={currentExercise.exercise_data.hint}
                value={typeValue}
                onChange={setTypeValue}
                disabled={feedbackStatus !== "idle"}
                languageCode={pathData?.course.code || "fr"}
                languageName={pathData?.course.title || "French"}
                isSpeechOnly={Boolean(currentExercise.exercise_data.is_speech_only)}
                locale={speechLocale}
              />
            )}
          </div>
        )}
      </main>

      {/* Signature Feedback Bar */}
      <FeedbackBar
        status={feedbackStatus}
        solutionText={solutionText}
        isCheckDisabled={isCheckDisabled()}
        onCheck={handleCheck}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
      />

      {/* Modals */}
      <QuitDialog
        isOpen={isQuitOpen}
        onClose={() => setIsQuitOpen(false)}
        onConfirmQuit={handleConfirmQuit}
      />

      <OutOfHeartsModal
        isOpen={isOutOfHeartsOpen}
        onRefillSuccess={(newHearts) => {
          setHearts(newHearts);
          setIsOutOfHeartsOpen(false);
          // The attempt is FAILED server-side once hearts hit zero —
          // refilling starts a fresh run from the learning path.
          queryClient.invalidateQueries({ queryKey: ["learningPath"] });
          router.push("/learn");
        }}
        onQuit={() => router.push("/learn")}
      />

        {completionData && (
          <LessonCompleteModal
            data={completionData}
            accuracy={accuracy}
          />
        )}
      </div>
    </AuthGuard>
  );
}
