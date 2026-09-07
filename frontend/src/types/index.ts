export type ExerciseType = 'WORD_BANK' | 'MULTIPLE_CHOICE' | 'MATCH' | 'FILL_BLANK' | 'TYPE_ANSWER';
export type SkillState = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED';

export interface SelectOption {
  id: string;
  text: string;
  translation?: string;
  image?: string;
}

export interface PublicExerciseData {
  options?: SelectOption[];
  sentence?: string;
  word_bank?: string[];
  pairs_left?: string[];
  pairs_right?: string[];
  sentence_parts?: string[];
  choices?: string[];
  prompt_sentence?: string;
  hint?: string;
}

export interface PublicExercise {
  id: string;
  lesson_id: string;
  order_index: number;
  type: ExerciseType;
  prompt: string;
  question_audio_url?: string | null;
  exercise_data: PublicExerciseData;
}

export interface LessonDetail {
  id: string;
  skill_id: string;
  order_index: number;
  title: string;
  xp_reward: number;
  estimated_duration: number;
  exercises: PublicExercise[];
}

export interface LessonSummary {
  id: string;
  title: string;
  order_index: number;
  xp_reward: number;
  estimated_duration: number;
}

export interface SkillPathNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  total_levels: number;
  level: number;
  progress_percentage: number;
  state: SkillState;
  lessons: LessonSummary[];
}

export interface UnitPathItem {
  id: string;
  order_index: number;
  title: string;
  description: string;
  banner_color: string;
  skills: SkillPathNode[];
}

export interface UserStatsSummary {
  xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  streak: number;
}

export interface LearningPathResponse {
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    flag_icon: string;
  };
  user_stats: UserStatsSummary;
  units: UnitPathItem[];
}

export interface AttemptCreateResponse {
  attempt_id: string;
  lesson_id: string;
  status: AttemptStatus;
  current_exercise_index: number;
  started_at: string;
}

export interface SubmittedExerciseHistory {
  exercise_id: string;
  is_correct: boolean;
  attempt_number: number;
}

export interface AttemptResumeResponse {
  attempt_id: string;
  lesson_id: string;
  status: AttemptStatus;
  current_exercise_index: number;
  hearts_remaining: number;
  hearts_lost: number;
  submitted_exercises: SubmittedExerciseHistory[];
  completion_result?: LessonCompleteResponse | null;
}

export interface ExerciseSubmitResponse {
  is_correct: boolean;
  solution_text: string;
  hearts_remaining: number;
  current_exercise_index: number;
  attempt_status: AttemptStatus;
  message?: string;
}

export interface LessonCompleteResponse {
  success: boolean;
  attempt_id: string;
  xp_awarded: number;
  gems_awarded: number;
  total_xp: number;
  streak: number;
  hearts_remaining: number;
  skill_level: number;
  is_skill_completed: boolean;
  new_achievements: AchievementOut[];
}

export interface AchievementOut {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string | null;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  streak: number;
  streak_active_today: boolean;
  achievements: AchievementOut[];
}

export interface UserStatsResponse {
  xp: number;
  gems: number;
  streak: number;
  hearts: number;
  total_lessons_completed: number;
  skills_completed: number;
  achievements_count: number;
}

export interface UserActivityItem {
  activity_date: string;
  xp_earned: number;
  lessons_completed: number;
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  user_id?: string | null;
  username: string;
  avatar_url: string;
  weekly_xp: number;
  is_current_user: boolean;
}

export interface HeartsRefillResponse {
  success: boolean;
  hearts: number;
  max_hearts: number;
  gems: number;
  message: string;
}
