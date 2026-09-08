"""Backend-authoritative exercise answer validation.

Dispatches on exercise type and compares the submitted answer against the
exercise's stored ``validation_data``. Correct answers never leave this
module's return path except as feedback after an incorrect submission.
"""

from __future__ import annotations

from typing import Any

from app.core.constants import ExerciseType
from app.core.exceptions import InvalidExerciseSubmissionError
from app.models.content import Exercise
from app.utils.answer_normalization import (
    NormalizationConfig,
    normalize_text,
    normalize_tokens,
)


class ValidationResult:
    """Outcome of validating one submission."""

    __slots__ = ("is_correct", "correct_answer")

    def __init__(self, is_correct: bool, correct_answer: Any = None) -> None:
        self.is_correct = is_correct
        self.correct_answer = correct_answer

    def __bool__(self) -> bool:  # Convenience: ``if validation:``.
        return self.is_correct


class ExerciseValidationService:
    def validate(self, exercise: Exercise, submitted_answer: dict[str, Any]) -> ValidationResult:
        """Validate ``submitted_answer`` for ``exercise``.

        Raises:
            InvalidExerciseSubmissionError: payload shape does not match type.
        """
        handler = {
            ExerciseType.MULTIPLE_CHOICE: self._validate_multiple_choice,
            ExerciseType.WORD_BANK: self._validate_word_bank,
            ExerciseType.MATCH: self._validate_match_pairs,
            ExerciseType.FILL_BLANK: self._validate_fill_blank,
            ExerciseType.TYPE_ANSWER: self._validate_type_answer,
        }.get(exercise.type)

        if handler is None:
            raise InvalidExerciseSubmissionError(f"Unsupported exercise type: {exercise.type}")

        validation = exercise.validation_data or {}
        config = NormalizationConfig.from_dict(validation.get("normalization"))
        return handler(exercise, validation, submitted_answer, config)

    # ------------------------------------------------------------ helpers ---

    def _outcome(self, validation: dict[str, Any], is_correct: bool) -> ValidationResult:
        """Correct submissions hide the answer; wrong ones show it as feedback."""
        if is_correct:
            return ValidationResult(True)
        return ValidationResult(False, self._display_answer(validation))

    @staticmethod
    def _display_answer(validation: dict[str, Any]) -> Any:
        """Human-friendly correct answer shown after a wrong submission."""
        display = validation.get("correct_answer_display")
        if display is not None:
            return display
        accepted = validation.get("accepted_answers")
        if isinstance(accepted, list) and accepted:
            first = accepted[0]
            return " ".join(first) if isinstance(first, list) else first
        return None

    def _require(self, submitted_answer: dict[str, Any], key: str, exercise_type: str) -> Any:
        value = submitted_answer.get(key)
        if value is None:
            raise InvalidExerciseSubmissionError(f"Missing '{key}' for {exercise_type} submission.")
        return value

    # ------------------------------------------------------ type handlers ---
    # Domain limits (audit §14): reject oversized submissions early.
    MAX_SELECTED_WORDS = 20
    MAX_PAIRS = 20
    MAX_TOKEN_LENGTH = 50
    MAX_TYPED_ANSWER_LENGTH = 500

    def _validate_multiple_choice(
        self,
        exercise: Exercise,
        validation: dict[str, Any],
        submitted_answer: dict[str, Any],
        config: NormalizationConfig,
    ) -> ValidationResult:
        selected = self._require(submitted_answer, "selected_option", "MULTIPLE_CHOICE")
        if not isinstance(selected, str):
            raise InvalidExerciseSubmissionError("selected_option must be a string.")

        correct_ids = validation.get("correct_option_ids", [])
        is_correct = any(
            normalize_text(str(cid), config) == normalize_text(selected, config)
            for cid in correct_ids
        )
        return self._outcome(validation, is_correct)

    def _validate_word_bank(
        self,
        exercise: Exercise,
        validation: dict[str, Any],
        submitted_answer: dict[str, Any],
        config: NormalizationConfig,
    ) -> ValidationResult:
        selected_words = self._require(submitted_answer, "selected_words", "WORD_BANK")
        if not isinstance(selected_words, list) or not all(
            isinstance(w, str) for w in selected_words
        ):
            raise InvalidExerciseSubmissionError("selected_words must be a list of strings.")
        if len(selected_words) > self.MAX_SELECTED_WORDS or any(
            len(w) > self.MAX_TOKEN_LENGTH for w in selected_words
        ):
            raise InvalidExerciseSubmissionError("selected_words exceeds size limits.")

        accepted: list[list[str]] = [
            a if isinstance(a, list) else [a] for a in validation.get("accepted_answers", [])
        ]
        normalized_submission = normalize_tokens(selected_words, config)
        is_correct = any(
            normalized_submission == normalize_tokens(answer, config) for answer in accepted
        )
        return self._outcome(validation, is_correct)

    def _validate_match_pairs(
        self,
        exercise: Exercise,
        validation: dict[str, Any],
        submitted_answer: dict[str, Any],
        config: NormalizationConfig,
    ) -> ValidationResult:
        pairs = self._require(submitted_answer, "pairs", "MATCH")
        if not isinstance(pairs, list) or not all(
            isinstance(p, dict) and "left" in p and "right" in p for p in pairs
        ):
            raise InvalidExerciseSubmissionError("pairs must be a list of {left, right} objects.")
        if len(pairs) > self.MAX_PAIRS:
            raise InvalidExerciseSubmissionError("pairs exceeds size limits.")

        expected: dict[str, str] = {
            str(left): str(right) for left, right in validation.get("correct_pairs", {}).items()
        }
        # The full set must match: same count, and every submitted pair correct.
        if len(pairs) != len(expected):
            return ValidationResult(False, self._display_answer(validation))

        for pair in pairs:
            left_key = normalize_text(str(pair["left"]), config)
            right_value = normalize_text(str(pair["right"]), config)
            expected_right = None
            for exp_left, exp_right in expected.items():
                if normalize_text(exp_left, config) == left_key:
                    expected_right = normalize_text(exp_right, config)
                    break
            if expected_right is None or expected_right != right_value:
                return ValidationResult(False, self._display_answer(validation))

        return ValidationResult(True, None)

    def _validate_fill_blank(
        self,
        exercise: Exercise,
        validation: dict[str, Any],
        submitted_answer: dict[str, Any],
        config: NormalizationConfig,
    ) -> ValidationResult:
        selected = self._require(submitted_answer, "selected_option", "FILL_BLANK")
        if not isinstance(selected, str):
            raise InvalidExerciseSubmissionError("selected_option must be a string.")

        accepted = validation.get("accepted_answers", [])
        is_correct = any(
            normalize_text(str(a), config) == normalize_text(selected, config) for a in accepted
        )
        return self._outcome(validation, is_correct)

    def _validate_type_answer(
        self,
        exercise: Exercise,
        validation: dict[str, Any],
        submitted_answer: dict[str, Any],
        config: NormalizationConfig,
    ) -> ValidationResult:
        answer = self._require(submitted_answer, "answer", "TYPE_ANSWER")
        if not isinstance(answer, str):
            raise InvalidExerciseSubmissionError("answer must be a string.")
        if len(answer) > self.MAX_TYPED_ANSWER_LENGTH:
            raise InvalidExerciseSubmissionError(
                f"answer exceeds {self.MAX_TYPED_ANSWER_LENGTH} characters."
            )

        accepted = validation.get("accepted_answers", [])
        is_correct = any(
            normalize_text(str(a), config) == normalize_text(answer, config) for a in accepted
        )
        return self._outcome(validation, is_correct)
