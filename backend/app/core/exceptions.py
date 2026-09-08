"""Reusable domain exceptions.

Every exception carries a stable machine-readable ``code`` that surfaces in
the standardized API error envelope (see ``error_handlers.py``). HTTP status
mapping lives in one place there, not in routers.
"""

from __future__ import annotations


class DomainError(Exception):
    """Base for all domain exceptions.

    Attributes:
        code: Stable error code used in the API error envelope.
        http_status: HTTP status the error handler maps this to.
        message: Human-readable description.
    """

    code: str = "DOMAIN_ERROR"
    http_status: int = 400

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.__class__.__doc__ or self.code
        super().__init__(self.message)


class NotFoundError(DomainError):
    code = "NOT_FOUND"
    http_status = 404

    def __init__(self, resource: str, resource_id: str | None = None) -> None:
        self.resource = resource
        self.resource_id = resource_id
        detail = f"{resource} not found" + (f": {resource_id}" if resource_id else "")
        super().__init__(detail)


class ValidationError(DomainError):
    code = "VALIDATION_ERROR"
    http_status = 422


class ConflictError(DomainError):
    code = "CONFLICT"
    http_status = 409


class ForbiddenError(DomainError):
    code = "FORBIDDEN"
    http_status = 403


class AttemptAlreadyCompletedError(ConflictError):
    code = "ATTEMPT_ALREADY_COMPLETED"


class AttemptNotInProgressError(ConflictError):
    code = "ATTEMPT_NOT_IN_PROGRESS"


class InsufficientHeartsError(ForbiddenError):
    code = "INSUFFICIENT_HEARTS"


class InsufficientGemsError(ForbiddenError):
    code = "INSUFFICIENT_GEMS"


class LessonLockedError(ForbiddenError):
    code = "LESSON_LOCKED"


class SkillLockedError(ForbiddenError):
    code = "SKILL_LOCKED"


class InvalidExerciseSubmissionError(ValidationError):
    code = "INVALID_EXERCISE_SUBMISSION"


class DuplicateXPError(ConflictError):
    """Raised when an XP transaction violates the idempotency constraint."""
