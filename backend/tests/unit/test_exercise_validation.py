"""Exercise validation unit tests: every type, plus normalization behavior."""

from __future__ import annotations

import pytest

from app.core.constants import ExerciseType
from app.core.exceptions import InvalidExerciseSubmissionError
from app.models.content import Exercise
from app.services.exercise_validation_service import ExerciseValidationService


def _exercise(
    etype: ExerciseType,
    validation_data: dict | None = None,
    exercise_data: dict | None = None,
) -> Exercise:
    return Exercise(
        lesson_id="lesson-x",
        order_index=1,
        type=etype,
        prompt="test",
        exercise_data=exercise_data,
        validation_data=validation_data,
    )


MC = _exercise(
    ExerciseType.MULTIPLE_CHOICE,
    {"correct_option_ids": ["b"], "correct_answer_display": "Hello"},
)
WB = _exercise(
    ExerciseType.WORD_BANK,
    {
        "accepted_answers": [["yo", "como", "pan"], ["como", "pan"]],
        "correct_answer_display": "yo como pan",
    },
)
MATCH = _exercise(
    ExerciseType.MATCH,
    {"correct_pairs": {"hola": "hello", "adiós": "goodbye"}},
)
FILL = _exercise(
    ExerciseType.FILL_BLANK, {"accepted_answers": ["días"], "correct_answer_display": "días"}
)
TYPE = _exercise(
    ExerciseType.TYPE_ANSWER,
    {"accepted_answers": ["Yo como pan"], "correct_answer_display": "Yo como pan"},
)
TYPE_ACCENT_SENSITIVE = _exercise(
    ExerciseType.TYPE_ANSWER,
    {
        "accepted_answers": ["pájaro"],
        "normalization": {"ignore_accents": True},
    },
)


class TestMultipleChoice:
    def test_correct(self) -> None:
        assert ExerciseValidationService().validate(MC, {"selected_option": "b"}).is_correct

    def test_incorrect(self) -> None:
        result = ExerciseValidationService().validate(MC, {"selected_option": "a"})
        assert not result.is_correct
        assert result.correct_answer == "Hello"

    def test_missing_field_raises(self) -> None:
        with pytest.raises(InvalidExerciseSubmissionError):
            ExerciseValidationService().validate(MC, {})


class TestWordBank:
    def test_correct_order(self) -> None:
        assert (
            ExerciseValidationService()
            .validate(WB, {"selected_words": ["yo", "como", "pan"]})
            .is_correct
        )

    def test_wrong_order_rejected(self) -> None:
        assert (
            not ExerciseValidationService()
            .validate(WB, {"selected_words": ["pan", "como", "yo"]})
            .is_correct
        )

    def test_alternate_accepted(self) -> None:
        assert (
            ExerciseValidationService().validate(WB, {"selected_words": ["como", "pan"]}).is_correct
        )

    def test_wrong_word(self) -> None:
        assert (
            not ExerciseValidationService()
            .validate(WB, {"selected_words": ["yo", "bebo", "pan"]})
            .is_correct
        )


class TestMatchPairs:
    def test_correct(self) -> None:
        result = ExerciseValidationService().validate(
            MATCH,
            {"pairs": [{"left": "hola", "right": "hello"}, {"left": "adiós", "right": "goodbye"}]},
        )
        assert result.is_correct

    def test_swapped_pair_rejected(self) -> None:
        assert (
            not ExerciseValidationService()
            .validate(
                MATCH,
                {
                    "pairs": [
                        {"left": "hola", "right": "goodbye"},
                        {"left": "adiós", "right": "hello"},
                    ]
                },
            )
            .is_correct
        )

    def test_incomplete_set_rejected(self) -> None:
        assert (
            not ExerciseValidationService()
            .validate(MATCH, {"pairs": [{"left": "hola", "right": "hello"}]})
            .is_correct
        )


class TestFillBlank:
    def test_correct(self) -> None:
        assert ExerciseValidationService().validate(FILL, {"selected_option": "días"}).is_correct

    def test_incorrect(self) -> None:
        result = ExerciseValidationService().validate(FILL, {"selected_option": "noches"})
        assert not result.is_correct


class TestTypeAnswer:
    def test_exact(self) -> None:
        assert ExerciseValidationService().validate(TYPE, {"answer": "Yo como pan"}).is_correct

    def test_case_normalized(self) -> None:
        assert ExerciseValidationService().validate(TYPE, {"answer": "yo COMO pan"}).is_correct

    def test_whitespace_normalized(self) -> None:
        assert (
            ExerciseValidationService().validate(TYPE, {"answer": "  Yo   como  pan  "}).is_correct
        )

    def test_punctuation_normalized(self) -> None:
        assert ExerciseValidationService().validate(TYPE, {"answer": "¡Yo como pan!"}).is_correct

    def test_wrong_answer(self) -> None:
        result = ExerciseValidationService().validate(TYPE, {"answer": "Yo bebo agua"})
        assert not result.is_correct
        assert result.correct_answer == "Yo como pan"

    def test_accents_respected_by_default(self) -> None:
        # pájaro with accent vs plain 'a' — default keeps accents distinct.
        no_accent_cfg = _exercise(
            ExerciseType.TYPE_ANSWER,
            {"accepted_answers": ["pájaro"]},
        )
        result = ExerciseValidationService().validate(no_accent_cfg, {"answer": "pajaro"})
        assert not result.is_correct

    def test_accents_ignored_when_configured(self) -> None:
        assert (
            ExerciseValidationService()
            .validate(TYPE_ACCENT_SENSITIVE, {"answer": "pajaro"})
            .is_correct
        )

    def test_missing_answer_raises(self) -> None:
        with pytest.raises(InvalidExerciseSubmissionError):
            ExerciseValidationService().validate(TYPE, {})


class TestMalformedSubmissions:
    def test_wrong_shape_types(self) -> None:
        service = ExerciseValidationService()
        with pytest.raises(InvalidExerciseSubmissionError):
            service.validate(WB, {"selected_words": "yo como pan"})  # not a list
        with pytest.raises(InvalidExerciseSubmissionError):
            service.validate(MATCH, {"pairs": [{"left": "hola"}]})  # missing right
        with pytest.raises(InvalidExerciseSubmissionError):
            service.validate(MC, {"selected_option": 42})  # not a string


class TestNormalizationConfig:
    def test_case_sensitivity_configurable(self) -> None:
        exercise = _exercise(
            ExerciseType.TYPE_ANSWER,
            {
                "accepted_answers": ["Hola"],
                "normalization": {"ignore_case": False},
            },
        )
        assert not ExerciseValidationService().validate(exercise, {"answer": "hola"}).is_correct
        assert ExerciseValidationService().validate(exercise, {"answer": "Hola"}).is_correct
