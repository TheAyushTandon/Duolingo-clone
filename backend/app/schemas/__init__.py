"""Aggregates all Pydantic schemas."""

from __future__ import annotations

from app.schemas.achievement import AchievementOut, AchievementsResponse
from app.schemas.attempt import (
    AttemptCreateResponse,
    AttemptDetailResponse,
    ExerciseSubmissionRequest,
    ExerciseSubmitResponse,
    LessonCompleteResponse,
    SubmittedExerciseHistory,
)
from app.schemas.common import ErrorBody, ErrorResponse, PaginatedResponse
from app.schemas.content import (
    ExerciseInternal,
    LessonDetail,
    LessonSummary,
    PublicExercise,
)
from app.schemas.gamification import LeaderboardResponse, LeaderboardUser
from app.schemas.learning_path import (
    CourseSummary,
    LearningPathResponse,
    SkillPathNode,
    UnitPathItem,
    UserStatsSummary,
)
from app.schemas.user import (
    ActivityEntry,
    ActivityPage,
    DevSimulateDayRequest,
    HeartsRefillResponse,
    HeartStatus,
    UserProfile,
    UserStats,
)

__all__ = [
    "AchievementOut",
    "AchievementsResponse",
    "ActivityEntry",
    "ActivityPage",
    "AttemptCreateResponse",
    "AttemptDetailResponse",
    "CourseSummary",
    "DevSimulateDayRequest",
    "ErrorBody",
    "ErrorResponse",
    "ExerciseInternal",
    "ExerciseSubmitResponse",
    "ExerciseSubmissionRequest",
    "HeartStatus",
    "HeartsRefillResponse",
    "LeaderboardResponse",
    "LeaderboardUser",
    "LearningPathResponse",
    "LessonCompleteResponse",
    "LessonDetail",
    "LessonSummary",
    "PaginatedResponse",
    "PublicExercise",
    "SkillPathNode",
    "SubmittedExerciseHistory",
    "UnitPathItem",
    "UserProfile",
    "UserStats",
    "UserStatsSummary",
]
