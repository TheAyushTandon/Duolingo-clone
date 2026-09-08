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
  AchievementOut,
  CourseOut,
  AuthResponse,
} from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
const TOKEN_KEY = "duo_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "API Error";
    try {
      const json = await res.json();
      // Backend envelope: {detail: {code, message}} or string
      errorDetail =
        json.detail?.message ||
        json.detail?.error?.message ||
        (typeof json.detail === "string" ? json.detail : null) ||
        JSON.stringify(json);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

// 0. Authentication
export async function registerUser(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse<AuthResponse>(res);
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse<AuthResponse>(res);
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/me`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<UserProfileResponse>(res);
}

export function logout(): void {
  removeStoredToken();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

// 1. Learning Path & Courses
export async function fetchLearningPath(): Promise<LearningPathResponse> {
  const res = await fetch(`${API_BASE_URL}/learning-path`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<LearningPathResponse>(res);
}

export async function fetchCourses(): Promise<CourseOut[]> {
  const res = await fetch(`${API_BASE_URL}/courses`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<CourseOut[]>(res);
}

export async function setActiveCourse(courseId: string): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/profile/course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ course_id: courseId }),
  });
  return handleResponse<UserProfileResponse>(res);
}

// 2. Lessons & Attempts
export async function fetchLesson(lessonId: string): Promise<LessonDetail> {
  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<LessonDetail>(res);
}

export async function startLessonAttempt(lessonId: string): Promise<AttemptCreateResponse> {
  const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/attempts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return handleResponse<AttemptCreateResponse>(res);
}

export async function resumeLessonAttempt(attemptId: string): Promise<AttemptResumeResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<AttemptResumeResponse>(res);
}

export async function submitExerciseAnswer(
  attemptId: string,
  exerciseId: string,
  submittedAnswer: unknown
): Promise<ExerciseSubmitResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/exercises/${exerciseId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ submitted_answer: submittedAnswer }),
  });
  return handleResponse<ExerciseSubmitResponse>(res);
}

export async function completeLessonAttempt(attemptId: string): Promise<LessonCompleteResponse> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return handleResponse<LessonCompleteResponse>(res);
}

export async function abandonLessonAttempt(attemptId: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/lesson-attempts/${attemptId}/abandon`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<{ status: string }>(res);
}

// 3. User & Profile
export async function fetchProfile(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<UserProfileResponse>(res);
}

export async function updateSettings(
  settings: { daily_goal_xp?: number }
): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/profile/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(settings),
  });
  return handleResponse<UserProfileResponse>(res);
}

export async function fetchProfileStats(): Promise<UserStatsResponse> {
  const res = await fetch(`${API_BASE_URL}/profile/stats`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<UserStatsResponse>(res);
}

export async function fetchProfileActivity(): Promise<{
  items: UserActivityItem[];
  next_cursor: string | null;
}> {
  const res = await fetch(`${API_BASE_URL}/profile/activity`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<{ items: UserActivityItem[]; next_cursor: string | null }>(res);
}

// 4. Gamification
export async function refillHearts(isPractice = false): Promise<HeartsRefillResponse> {
  const res = await fetch(`${API_BASE_URL}/hearts/refill?is_practice=${isPractice}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<HeartsRefillResponse>(res);
}

export async function fetchLeaderboard(): Promise<LeaderboardUser[]> {
  const res = await fetch(`${API_BASE_URL}/leaderboard`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<LeaderboardUser[]>(res);
}

export async function fetchAchievements(): Promise<AchievementOut[]> {
  const res = await fetch(`${API_BASE_URL}/achievements`, {
    cache: "no-store",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<AchievementOut[]>(res);
}

// 5. Dev Tools
export async function simulateDay(days = 1): Promise<{ success: boolean; streak: number; message: string }> {
  const res = await fetch(`${API_BASE_URL}/dev/simulate-day?days=${days}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<{ success: boolean; streak: number; message: string }>(res);
}

export async function resetProgress(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/dev/reset-progress`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}
