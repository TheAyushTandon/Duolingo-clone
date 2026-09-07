import {
  LearningPathResponse,
  LessonDetail,
  AttemptCreateResponse,
  AttemptResumeResponse,
  ExerciseSubmitResponse,
  LessonCompleteResponse,
  UserProfileResponse,
  UserStatsResponse,
  UserActivityItem,
  LeaderboardUser,
  HeartsRefillResponse,
  AchievementOut
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "API Error";
    try {
      const json = await res.json();
      errorDetail = json.detail?.error?.message || json.detail || JSON.stringify(json);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

// 1. Learning Path
export async function fetchLearningPath(): Promise<LearningPathResponse> {
  const res = await fetch(`${API_BASE_URL}/learning-path`, { cache: 'no-store' });
  return handleResponse<LearningPathResponse>(res);
}

// 2. Lessons & Attempts
export async function fetchLesson(lessonId: string): Promise<LessonDetail> {
  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, { cache: 'no-store' });
  return handleResponse<LessonDetail>(res);
}

export async function startLessonAttempt(lessonId: string): Promise<AttemptCreateResponse> {
  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return handleResponse<AttemptCreateResponse>(res);
}

export async function resumeLessonAttempt(attemptId: string): Promise<AttemptResumeResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}`, { cache: 'no-store' });
  return handleResponse<AttemptResumeResponse>(res);
}

export async function submitExerciseAnswer(
  attemptId: string,
  exerciseId: string,
  submittedAnswer: unknown
): Promise<ExerciseSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/exercises/${exerciseId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submitted_answer: submittedAnswer })
  });
  return handleResponse<ExerciseSubmitResponse>(res);
}

export async function completeLessonAttempt(attemptId: string): Promise<LessonCompleteResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return handleResponse<LessonCompleteResponse>(res);
}

export async function abandonLessonAttempt(attemptId: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/abandon`, {
    method: "POST"
  });
  return handleResponse<{ status: string }>(res);
}

// 3. User & Profile
export async function fetchProfile(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/profile`, { cache: 'no-store' });
  return handleResponse<UserProfileResponse>(res);
}

export async function fetchProfileStats(): Promise<UserStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/profile/stats`, { cache: 'no-store' });
  return handleResponse<UserStatsResponse>(res);
}

export async function fetchProfileActivity(): Promise<UserActivityItem[]> {
  const res = await fetch(`${API_BASE_URL}/profile/activity`, { cache: 'no-store' });
  return handleResponse<UserActivityItem[]>(res);
}

// 4. Gamification
export async function refillHearts(isPractice = false): Promise<HeartsRefillResponse> {
  const res = await fetch(`${API_BASE_URL}/hearts/refill?is_practice=${isPractice}`, {
    method: "POST"
  });
  return handleResponse<HeartsRefillResponse>(res);
}

export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  const res = await fetch(`${API_BASE_URL}/leaderboard`, { cache: 'no-store' });
  return handleResponse<LeaderboardUser[]>(res);
}

export async function fetchAchievements(): Promise<AchievementOut[]> {
  const res = await fetch(`${API_BASE_URL}/achievements`, { cache: 'no-store' });
  return handleResponse<AchievementOut[]>(res);
}

// 5. Dev Tools
export async function simulateDay(days = 1): Promise<{ success: boolean; streak: number; message: string }> {
  const res = await fetch(`${API_BASE_URL}/dev/simulate-day?days=${days}`, {
    method: "POST"
  });
  return handleResponse<{ success: boolean; streak: number; message: string }>(res);
}

export async function resetProgress(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/dev/reset-progress`, {
    method: "POST"
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}
