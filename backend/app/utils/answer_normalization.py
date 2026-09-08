"""Centralized answer normalization.

Applied before comparing free-typed (and some token) answers to accepted
answers. Configurable per exercise via the validation data's
``normalization`` block so, for example, accents are preserved for Spanish
listening exercises but ignored for translation exercises.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field


def _strip_punctuation(text: str) -> str:
    """Remove Unicode punctuation only (category P*).

    Deliberately keeps combining marks (category Mn) so that NFKD-decomposed
    accents survive when ``ignore_accents`` is false — stripping "anything
    not \\w" would silently delete accents.
    """
    return "".join(ch for ch in text if not unicodedata.category(ch).startswith("P"))


@dataclass(frozen=True)
class NormalizationConfig:
    """Configurable normalization rules. Defaults favor Spanish learning."""

    ignore_case: bool = True
    ignore_accents: bool = False
    ignore_punctuation: bool = True
    # Extra separators treated as whitespace (e.g. hyphens in "acuérdese").
    extra_separators: frozenset[str] = field(default_factory=lambda: frozenset({"-"}))

    @classmethod
    def from_dict(cls, data: dict[str, object] | None) -> NormalizationConfig:
        """Build a config from an exercise's ``normalization`` block."""
        if not data:
            return cls()
        return cls(
            ignore_case=bool(data.get("ignore_case", True)),
            ignore_accents=bool(data.get("ignore_accents", False)),
            ignore_punctuation=bool(data.get("ignore_punctuation", True)),
        )


def _strip_accents(text: str) -> str:
    """Decompose unicode and drop combining marks (NFD then remove Mn category)."""
    decomposed = unicodedata.normalize("NFD", text)
    return "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")


def normalize_text(text: str, config: NormalizationConfig | None = None) -> str:
    """Normalize one string for comparison.

    Pipeline: NFKD -> optional accent strip -> optional lowercase ->
    extra-separator replacement -> whitespace collapse -> optional punctuation strip.
    """
    if config is None:
        config = NormalizationConfig()

    result = unicodedata.normalize("NFKD", text)

    if config.ignore_accents:
        result = _strip_accents(result)

    if config.ignore_case:
        result = result.lower()

    for sep in config.extra_separators:
        result = result.replace(sep, " ")

    result = re.sub(r"\s+", " ", result).strip()

    if config.ignore_punctuation:
        result = _strip_punctuation(result)
        result = re.sub(r"\s+", " ", result).strip()

    return result


def normalize_tokens(tokens: list[str], config: NormalizationConfig | None = None) -> list[str]:
    """Normalize every token in a word-bank answer, preserving order."""
    return [normalize_text(token, config) for token in tokens]
