"""Course content seed: French (default) + English.

Two courses, matching the frontend's register page (frontend/src/app/register).
Prompts are written in the site language (English); the content being taught
is the target language. ``exercise_data`` is client-safe; ``validation_data``
holds the answers and is never exposed via the API.

Exercise data shapes follow the frontend contract:
- MULTIPLE_CHOICE -> options
- WORD_BANK -> sentence, word_bank, is_speech_only
- MATCH -> pairs_left, pairs_right, pairs_map
- FILL_BLANK -> sentence_parts, choices
- TYPE_ANSWER -> prompt_sentence, hint, is_speech_only

Idempotent: content is looked up by stable natural keys before insertion,
preserving existing skill IDs and user progress.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.constants import ExerciseType
from app.models.content import Course, Exercise, Lesson, Skill, Unit

COURSE_CODES = ("fr", "en")
DEFAULT_COURSE_CODE = "fr"


def _get_course(db: Session, code: str) -> Course | None:
    return db.scalar(select(Course).where(Course.code == code))


def seed_content(db: Session) -> list[Course]:
    """Create or refresh seeded courses idempotently without wiping user progress."""
    db.execute(delete(Course).where(Course.code.notin_(COURSE_CODES)))

    courses: list[Course] = []
    for course_spec in _COURSES:
        course = _get_course(db, course_spec["code"])
        if course is None:
            course = Course(
                title=course_spec["title"],
                code=course_spec["code"],
                description=course_spec["description"],
                flag_icon=course_spec["flag_icon"],
                speech_locale=course_spec["speech_locale"],
            )
            db.add(course)
            db.flush()
        else:
            course.title = course_spec["title"]
            course.description = course_spec["description"]
            course.flag_icon = course_spec["flag_icon"]
            course.speech_locale = course_spec["speech_locale"]

        for unit_spec in course_spec["units"]:
            unit = db.scalar(
                select(Unit).where(
                    Unit.course_id == course.id,
                    Unit.order_index == unit_spec["order"],
                )
            )
            if unit is None:
                unit = Unit(
                    course_id=course.id,
                    order_index=unit_spec["order"],
                    title=unit_spec["title"],
                    description=unit_spec["description"],
                    banner_color=unit_spec["banner_color"],
                )
                db.add(unit)
                db.flush()
            else:
                unit.title = unit_spec["title"]
                unit.description = unit_spec["description"]
                unit.banner_color = unit_spec["banner_color"]

            for skill_spec in unit_spec["skills"]:
                # Match by natural key (unit_id + title), else (unit_id + order_index)
                skill = db.scalar(
                    select(Skill).where(
                        Skill.unit_id == unit.id,
                        Skill.title == skill_spec["title"],
                    )
                )
                if skill is None:
                    skill = db.scalar(
                        select(Skill).where(
                            Skill.unit_id == unit.id,
                            Skill.order_index == skill_spec["order"],
                        )
                    )

                if skill is None:
                    skill = Skill(
                        unit_id=unit.id,
                        order_index=skill_spec["order"],
                        title=skill_spec["title"],
                        description=skill_spec["description"],
                        icon=skill_spec["icon"],
                        total_levels=len(skill_spec["lessons"]),
                    )
                    db.add(skill)
                    db.flush()
                else:
                    skill.order_index = skill_spec["order"]
                    skill.title = skill_spec["title"]
                    skill.description = skill_spec["description"]
                    skill.icon = skill_spec["icon"]
                    skill.total_levels = max(skill.total_levels, len(skill_spec["lessons"]))

                for lesson_index, lesson_spec in enumerate(skill_spec["lessons"], start=1):
                    lesson = db.scalar(
                        select(Lesson).where(
                            Lesson.skill_id == skill.id,
                            Lesson.order_index == lesson_index,
                        )
                    )
                    if lesson is None:
                        lesson = Lesson(
                            skill_id=skill.id,
                            order_index=lesson_index,
                            title=lesson_spec["title"],
                            xp_reward=lesson_spec["xp_reward"],
                            estimated_duration=lesson_spec.get("estimated_duration", 120),
                        )
                        db.add(lesson)
                        db.flush()
                    else:
                        lesson.title = lesson_spec["title"]
                        lesson.xp_reward = lesson_spec["xp_reward"]
                        lesson.estimated_duration = lesson_spec.get("estimated_duration", 120)

                    for exercise_index, exercise_spec in enumerate(
                        lesson_spec["exercises"], start=1
                    ):
                        exercise = db.scalar(
                            select(Exercise).where(
                                Exercise.lesson_id == lesson.id,
                                Exercise.order_index == exercise_index,
                            )
                        )
                        if exercise is None:
                            exercise = Exercise(
                                lesson_id=lesson.id,
                                order_index=exercise_index,
                                type=ExerciseType(exercise_spec["type"]),
                                prompt=exercise_spec["prompt"],
                                exercise_data=exercise_spec["exercise_data"],
                                validation_data=exercise_spec["validation_data"],
                            )
                            db.add(exercise)
                        else:
                            exercise.type = ExerciseType(exercise_spec["type"])
                            exercise.prompt = exercise_spec["prompt"]
                            exercise.exercise_data = exercise_spec["exercise_data"]
                            exercise.validation_data = exercise_spec["validation_data"]

        courses.append(course)

    db.commit()
    return courses


# ---------------------------------------------------------------------------
# Exercise builders — exercise_data matches the frontend component props.
# ---------------------------------------------------------------------------


def _mc(
    prompt: str,
    options: list[tuple[str, str]],
    correct_ids: list[str],
    display: str,
) -> dict:
    return {
        "type": "MULTIPLE_CHOICE",
        "prompt": prompt,
        "exercise_data": {"options": [{"id": oid, "text": text} for oid, text in options]},
        "validation_data": {
            "correct_option_ids": correct_ids,
            "correct_answer_display": display,
        },
    }


def _wb(
    prompt: str,
    sentence: str,
    bank: list[str],
    accepted: list[list[str]],
    display: str,
    is_speech_only: bool = False,
) -> dict:
    return {
        "type": "WORD_BANK",
        "prompt": prompt,
        "exercise_data": {
            "sentence": sentence,
            "word_bank": bank,
            "is_speech_only": is_speech_only,
        },
        "validation_data": {
            "accepted_answers": accepted,
            "correct_answer_display": display,
        },
    }


def _match(prompt: str, pairs: dict[str, str]) -> dict:
    return {
        "type": "MATCH",
        "prompt": prompt,
        "exercise_data": {
            "pairs_left": list(pairs.keys()),
            "pairs_right": sorted(pairs.values()),
            "pairs_map": pairs,
        },
        "validation_data": {
            "correct_pairs": pairs,
            "correct_answer_display": "All pairs matched",
        },
    }


def _fill(
    prompt: str,
    sentence_parts: list[str],
    choices: list[str],
    answer: str,
) -> dict:
    return {
        "type": "FILL_BLANK",
        "prompt": prompt,
        "exercise_data": {
            "sentence_parts": sentence_parts,
            "choices": choices,
        },
        "validation_data": {
            "accepted_answers": [answer],
            "correct_answer_display": answer,
        },
    }


def _type(
    prompt: str,
    accepted: list[str],
    display: str,
    prompt_sentence: str | None = None,
    hint: str | None = None,
    normalization: dict | None = None,
    is_speech_only: bool = False,
) -> dict:
    exercise_data: dict[str, Any] = {}
    if prompt_sentence:
        exercise_data["prompt_sentence"] = prompt_sentence
    if hint:
        exercise_data["hint"] = hint
    if is_speech_only:
        exercise_data["is_speech_only"] = True
    validation: dict = {"accepted_answers": accepted, "correct_answer_display": display}
    if normalization:
        validation["normalization"] = normalization
    return {
        "type": "TYPE_ANSWER",
        "prompt": prompt,
        "exercise_data": exercise_data,
        "validation_data": validation,
    }


def _speech_wb(
    prompt: str,
    sentence: str,
    bank: list[str],
    accepted: list[list[str]],
    display: str,
) -> dict:
    """Pure speech comprehension: prompt sentence is hidden, user taps what they hear."""
    return _wb(prompt, sentence, bank, accepted, display, is_speech_only=True)


def _speech_type(
    prompt: str,
    spoken_sentence: str,
    accepted: list[str],
    display: str,
    hint: str | None = None,
    normalization: dict | None = None,
) -> dict:
    """Pure speech typing: prompt sentence is hidden, user types what they hear."""
    return _type(
        prompt,
        accepted,
        display,
        prompt_sentence=spoken_sentence,
        hint=hint,
        normalization=normalization,
        is_speech_only=True,
    )


# ---------------------------------------------------------------------------
# Course definitions — French (target) & English (target)
# ---------------------------------------------------------------------------

_FRENCH_UNITS: list[dict] = [
    {
        "order": 1,
        "title": "Basics",
        "description": "Greetings, food, and animals",
        "banner_color": "#58cc02",
        "skills": [
            {
                "order": 1,
                "title": "Greetings",
                "description": "Say hello and introduce yourself",
                "icon": "👋",
                "lessons": [
                    {
                        "title": "Hello!",
                        "xp_reward": 10,
                        "exercises": [
                            _mc(
                                "What does 'bonjour' mean?",
                                [
                                    ("a", "Goodbye"),
                                    ("b", "Hello"),
                                    ("c", "Please"),
                                    ("d", "Thanks"),
                                ],
                                ["b"],
                                "Hello",
                            ),
                            _type(
                                "Translate into French: hello",
                                ["bonjour"],
                                "bonjour",
                                prompt_sentence="hello",
                            ),
                            _wb(
                                "Translate this sentence",
                                "Good morning",
                                ["bonjour", "soir", "matin", "nuit"],
                                [["bonjour"]],
                                "bonjour",
                            ),
                            _match(
                                "Match the greetings",
                                {"bonjour": "hello", "au revoir": "goodbye", "merci": "thank you"},
                            ),
                        ],
                    },
                    {
                        "title": "Introductions",
                        "xp_reward": 15,
                        "exercises": [
                            _wb(
                                "Translate this sentence",
                                "I am Ana",
                                ["je", "suis", "Ana", "tu", "es"],
                                [["je", "suis", "Ana"]],
                                "je suis Ana",
                            ),
                            _fill(
                                "Complete the phrase",
                                ["Comment ", "-vous ?"],
                                ["allez", "vas", "va"],
                                "allez",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "merci beaucoup",
                                ["merci beaucoup", "merci"],
                                "merci beaucoup",
                                hint="Two words of gratitude",
                            ),
                            _match(
                                "Match the pairs",
                                {"oui": "yes", "non": "no", "s'il vous plaît": "please"},
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 2,
                "title": "Food",
                "description": "Talk about what you eat",
                "icon": "🍎",
                "lessons": [
                    {
                        "title": "I eat bread",
                        "xp_reward": 10,
                        "exercises": [
                            _wb(
                                "Translate this sentence",
                                "I eat bread",
                                ["je", "mange", "du", "pain", "eau", "bois"],
                                [["je", "mange", "du", "pain"]],
                                "je mange du pain",
                            ),
                            _type(
                                "Translate into French: water",
                                ["eau", "l'eau"],
                                "eau",
                                prompt_sentence="water",
                            ),
                            _mc(
                                "What does 'pomme' mean?",
                                [("a", "Bread"), ("b", "Milk"), ("c", "Apple"), ("d", "Water")],
                                ["c"],
                                "Apple",
                            ),
                        ],
                    },
                    {
                        "title": "At the table",
                        "xp_reward": 15,
                        "exercises": [
                            _match(
                                "Match the foods",
                                {"pain": "bread", "lait": "milk", "eau": "water", "café": "coffee"},
                            ),
                            _fill(
                                "Complete: I drink water",
                                ["Je bois de l'", "."],
                                ["eau", "pain", "lait"],
                                "eau",
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "Un café s'il vous plaît",
                                ["Un", "café", "s'il", "vous", "plaît", "pain", "lait"],
                                [["Un", "café", "s'il", "vous", "plaît"]],
                                "Un café s'il vous plaît",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 3,
                "title": "Everyday Words",
                "description": "Animals and common phrases",
                "icon": "🐱",
                "lessons": [
                    {
                        "title": "Animals & Friends",
                        "xp_reward": 15,
                        "exercises": [
                            _mc(
                                "'le chat' is...",
                                [("a", "Dog"), ("b", "Cat"), ("c", "Bird"), ("d", "Fish")],
                                ["b"],
                                "Cat",
                            ),
                            _match(
                                "Match the animals",
                                {
                                    "chien": "dog",
                                    "chat": "cat",
                                    "oiseau": "bird",
                                    "cheval": "horse",
                                },
                            ),
                            _type(
                                "Translate into French: dog",
                                ["chien", "le chien"],
                                "chien",
                                prompt_sentence="dog",
                            ),
                        ],
                    },
                    {
                        "title": "Daily Routine",
                        "xp_reward": 15,
                        "exercises": [
                            _wb(
                                "Translate this sentence",
                                "The cat drinks water",
                                ["le", "chat", "boit", "de", "l'eau", "mange"],
                                [["le", "chat", "boit", "de", "l'eau"]],
                                "le chat boit de l'eau",
                            ),
                            _fill(
                                "Complete: the dog eats",
                                ["Le chien ", "."],
                                ["mange", "boit", "dort"],
                                "mange",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "La maison est belle",
                                ["La maison est belle", "la maison est belle"],
                                "La maison est belle",
                                hint="The house is beautiful",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 4,
                "title": "Listening Lab",
                "description": "Tune your ears with audio-only comprehension",
                "icon": "headphones",
                "lessons": [
                    {
                        "title": "Écoute Rapide 1",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_wb(
                                "Tap what you hear",
                                "Bonjour et bienvenue à Paris",
                                ["Bonjour", "et", "bienvenue", "à", "Paris", "merci", "demain"],
                                [["Bonjour", "et", "bienvenue", "à", "Paris"]],
                                "Bonjour et bienvenue à Paris",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Je voudrais un croissant chaud",
                                [
                                    "Je voudrais un croissant chaud",
                                    "je voudrais un croissant chaud",
                                ],
                                "Je voudrais un croissant chaud",
                                hint="Order a warm pastry",
                            ),
                            _match(
                                "Match speech vocabulary",
                                {
                                    "vite": "fast",
                                    "écouter": "to listen",
                                    "chuchoter": "to whisper",
                                    "parler": "to speak",
                                },
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "Où se trouve la gare",
                                ["Où", "se", "trouve", "la", "gare", "le", "musée"],
                                [["Où", "se", "trouve", "la", "gare"]],
                                "Où se trouve la gare",
                            ),
                        ],
                    },
                    {
                        "title": "Écoute Rapide 2",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_type(
                                "Type what you hear",
                                "Le train part à dix heures",
                                ["Le train part à dix heures", "le train part à dix heures"],
                                "Le train part à dix heures",
                                hint="The train departs at ten o'clock",
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "Nous voyageons ensemble cet été",
                                ["Nous", "voyageons", "ensemble", "cet", "été", "hier", "plage"],
                                [["Nous", "voyageons", "ensemble", "cet", "été"]],
                                "Nous voyageons ensemble cet été",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Merci pour votre aide précieuse",
                                [
                                    "Merci pour votre aide précieuse",
                                    "merci pour votre aide précieuse",
                                ],
                                "Merci pour votre aide précieuse",
                                hint="Thank you for your valuable help",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 5,
                "title": "Grammar Sprint",
                "description": "Speed conjugations and sentence structure",
                "icon": "⚡",
                "lessons": [
                    {
                        "title": "Conjugaison Express",
                        "xp_reward": 20,
                        "exercises": [
                            _mc(
                                "Choose the correct form: 'Elles ___ au marché'",
                                [("a", "vont"), ("b", "vas"), ("c", "va"), ("d", "allez")],
                                ["a"],
                                "vont",
                            ),
                            _match(
                                "Match irregular verbs",
                                {
                                    "être": "to be",
                                    "avoir": "to have",
                                    "faire": "to do",
                                    "aller": "to go",
                                },
                            ),
                            _fill(
                                "Fill the blank: Si j'avais le temps, je ___ avec toi.",
                                ["Si j'avais le temps, je ", " avec toi."],
                                ["viendrais", "venais", "viendrai"],
                                "viendrais",
                            ),
                            _type(
                                "Type the feminine form of 'heureux'",
                                ["heureuse"],
                                "heureuse",
                                hint="Changes -eux to -euse",
                            ),
                        ],
                    },
                    {
                        "title": "Phrases Complexes",
                        "xp_reward": 25,
                        "exercises": [
                            _wb(
                                "Build the sentence",
                                "Bien qu'il pleuve nous sortons",
                                ["Bien", "qu'il", "pleuve", "nous", "sortons", "quand", "soleil"],
                                [["Bien", "qu'il", "pleuve", "nous", "sortons"]],
                                "Bien qu'il pleuve nous sortons",
                            ),
                            _match(
                                "Match opposites",
                                {
                                    "toujours": "jamais",
                                    "tout": "rien",
                                    "beaucoup": "peu",
                                    "facile": "difficile",
                                },
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Chaque voyage commence par un petit pas",
                                [
                                    "Chaque voyage commence par un petit pas",
                                    "chaque voyage commence par un petit pas",
                                ],
                                "Chaque voyage commence par un petit pas",
                                hint="Every journey starts with a small step",
                            ),
                        ],
                    },
                ],
            },
        ],
    },
    {
        "order": 2,
        "title": "Simple Sentences",
        "description": "Actions, questions, and descriptions",
        "banner_color": "#1cb0f6",
        "skills": [
            {
                "order": 1,
                "title": "Actions",
                "description": "Everyday verbs",
                "icon": "🏃",
                "lessons": [
                    {
                        "title": "I run",
                        "xp_reward": 15,
                        "exercises": [
                            _wb(
                                "Translate this sentence",
                                "I run every day",
                                ["je", "cours", "tous", "les", "jours", "mange"],
                                [["je", "cours", "tous", "les", "jours"]],
                                "je cours tous les jours",
                            ),
                            _type(
                                "Translate this sentence",
                                ["je parle français", "parle français"],
                                "je parle français",
                                prompt_sentence="I speak French",
                                normalization={"ignore_accents": True},
                            ),
                            _mc(
                                "'je mange' means...",
                                [
                                    ("a", "I eat"),
                                    ("b", "I drink"),
                                    ("c", "I run"),
                                    ("d", "I speak"),
                                ],
                                ["a"],
                                "I eat",
                            ),
                        ],
                    },
                    {
                        "title": "Daily verbs",
                        "xp_reward": 15,
                        "exercises": [
                            _match(
                                "Match action verbs",
                                {
                                    "marcher": "to walk",
                                    "dormir": "to sleep",
                                    "lire": "to read",
                                    "écrire": "to write",
                                },
                            ),
                            _fill(
                                "Complete: Nous ___ un livre",
                                ["Nous ", " un livre."],
                                ["lisons", "lit", "lis"],
                                "lisons",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 2,
                "title": "Questions",
                "description": "Ask and answer",
                "icon": "❓",
                "lessons": [
                    {
                        "title": "What is your name?",
                        "xp_reward": 20,
                        "exercises": [
                            _wb(
                                "Translate this sentence",
                                "What is your name?",
                                ["comment", "tu", "t'appelles", "où", "habites"],
                                [["comment", "tu", "t'appelles"]],
                                "comment tu t'appelles",
                            ),
                            _type(
                                "Which French word means 'where'?",
                                ["où"],
                                "où",
                                normalization={"ignore_accents": True},
                            ),
                            _mc(
                                "'pourquoi' means...",
                                [("a", "When"), ("b", "Where"), ("c", "Why"), ("d", "Who")],
                                ["c"],
                                "Why",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 3,
                "title": "Travel & City",
                "description": "Navigate hotels and airports",
                "icon": "✈️",
                "lessons": [
                    {
                        "title": "At the station",
                        "xp_reward": 15,
                        "exercises": [
                            _match(
                                "Match travel terms",
                                {
                                    "billet": "ticket",
                                    "valise": "suitcase",
                                    "train": "train",
                                    "avion": "airplane",
                                },
                            ),
                            _fill(
                                "Complete: Deux billets pour Paris ___",
                                ["Deux billets pour Paris ", "."],
                                ["s'il vous plaît", "merci", "bonjour"],
                                "s'il vous plaît",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 4,
                "title": "Atelier Audio",
                "description": "Advanced French listening immersion",
                "icon": "headphones",
                "lessons": [
                    {
                        "title": "Défi Audio 2",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_wb(
                                "Tap what you hear",
                                "Quelle heure est-il s'il vous plaît",
                                ["Quelle", "heure", "est-il", "s'il", "vous", "plaît", "demain"],
                                [["Quelle", "heure", "est-il", "s'il", "vous", "plaît"]],
                                "Quelle heure est-il s'il vous plaît",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Il fait beau aujourd'hui à Nice",
                                [
                                    "Il fait beau aujourd'hui à Nice",
                                    "il fait beau aujourd'hui à Nice",
                                ],
                                "Il fait beau aujourd'hui à Nice",
                                hint="The weather is nice today in Nice",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 5,
                "title": "Master French",
                "description": "Unit 2 mastery challenge",
                "icon": "🏆",
                "lessons": [
                    {
                        "title": "Grand Défi",
                        "xp_reward": 25,
                        "exercises": [
                            _wb(
                                "Build the sentence",
                                "Nous apprenons le français avec passion",
                                ["Nous", "apprenons", "le", "français", "avec", "passion", "vite"],
                                [["Nous", "apprenons", "le", "français", "avec", "passion"]],
                                "Nous apprenons le français avec passion",
                            ),
                            _match(
                                "Match final master pairs",
                                {
                                    "réussite": "success",
                                    "avenir": "future",
                                    "progrès": "progress",
                                    "joie": "joy",
                                },
                            ),
                        ],
                    },
                ],
            },
        ],
    },
]

_ENGLISH_UNITS: list[dict] = [
    {
        "order": 1,
        "title": "Essentials",
        "description": "Greetings, food, and daily conversation",
        "banner_color": "#58cc02",
        "skills": [
            {
                "order": 1,
                "title": "Greetings",
                "description": "Say hello and make polite introductions",
                "icon": "👋",
                "lessons": [
                    {
                        "title": "Hello!",
                        "xp_reward": 10,
                        "exercises": [
                            _mc(
                                "What does 'Good morning' mean?",
                                [
                                    ("a", "Greeting used when going to bed"),
                                    ("b", "Polite greeting used in the morning"),
                                    ("c", "Asking someone for food"),
                                    ("d", "Saying goodbye forever"),
                                ],
                                ["b"],
                                "Polite greeting used in the morning",
                            ),
                            _type(
                                "Type the casual greeting: hello",
                                ["hello", "hi"],
                                "hello",
                                prompt_sentence="hello",
                            ),
                            _match(
                                "Match the greetings with their replies",
                                {
                                    "hello": "hi",
                                    "goodbye": "see you later",
                                    "good night": "sweet dreams",
                                    "thank you": "you're welcome",
                                },
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "Nice to meet you today",
                                ["Nice", "to", "meet", "you", "today", "tomorrow", "see"],
                                [["Nice", "to", "meet", "you", "today"]],
                                "Nice to meet you today",
                            ),
                        ],
                    },
                    {
                        "title": "First Words",
                        "xp_reward": 15,
                        "exercises": [
                            _wb(
                                "Build the sentence",
                                "My name is Alex",
                                ["My", "name", "is", "Alex", "are", "you"],
                                [["My", "name", "is", "Alex"]],
                                "My name is Alex",
                            ),
                            _fill(
                                "Complete: Where ___ you from?",
                                ["Where ", " you from?"],
                                ["are", "is", "am"],
                                "are",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Welcome to our team",
                                ["Welcome to our team", "welcome to our team"],
                                "Welcome to our team",
                                hint="Friendly workplace greeting",
                            ),
                            _match(
                                "Match the polite expressions",
                                {
                                    "excuse me": "pardon me",
                                    "pleased to meet you": "delighted to know you",
                                    "take care": "stay safe",
                                },
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 2,
                "title": "Food",
                "description": "Meals, café orders, and delicious treats",
                "icon": "🍎",
                "lessons": [
                    {
                        "title": "At the café",
                        "xp_reward": 10,
                        "exercises": [
                            _match(
                                "Match the café items",
                                {
                                    "coffee": "hot morning brew",
                                    "sandwich": "lunch between bread slices",
                                    "water": "clear hydration",
                                    "croissant": "flaky butter pastry",
                                },
                            ),
                            _fill(
                                "Complete: I would ___ a table for two",
                                ["I would ", " a table for two."],
                                ["like", "likes", "liking"],
                                "like",
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "A cup of hot coffee please",
                                ["A", "cup", "of", "hot", "coffee", "tea", "please", "cold"],
                                [["A", "cup", "of", "hot", "coffee", "please"]],
                                "A cup of hot coffee please",
                            ),
                            _type(
                                "Type the plural of 'child'",
                                ["children"],
                                "children",
                                prompt_sentence="child",
                                hint="An irregular plural noun",
                            ),
                        ],
                    },
                    {
                        "title": "Dinner Time",
                        "xp_reward": 15,
                        "exercises": [
                            _wb(
                                "Build the sentence",
                                "We are having dinner together",
                                ["We", "are", "having", "dinner", "together", "lunch", "eating"],
                                [["We", "are", "having", "dinner", "together"]],
                                "We are having dinner together",
                            ),
                            _mc(
                                "Which meal is eaten in the middle of the day?",
                                [
                                    ("a", "Breakfast"),
                                    ("b", "Lunch"),
                                    ("c", "Dinner"),
                                    ("d", "Midnight snack"),
                                ],
                                ["b"],
                                "Lunch",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Can we see the dessert menu please",
                                [
                                    "Can we see the dessert menu please",
                                    "can we see the dessert menu please",
                                ],
                                "Can we see the dessert menu please",
                                hint="Asking the waiter for sweets",
                            ),
                            _match(
                                "Match the flavors",
                                {
                                    "sweet": "like honey",
                                    "sour": "like a lemon",
                                    "spicy": "like chili pepper",
                                    "salty": "like sea crisps",
                                },
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 3,
                "title": "Daily Phrases",
                "description": "Essential expressions for everyday life",
                "icon": "💬",
                "lessons": [
                    {
                        "title": "Everyday Chats",
                        "xp_reward": 15,
                        "exercises": [
                            _mc(
                                "How do you politely ask someone for help?",
                                [
                                    ("a", "Could you please help me?"),
                                    ("b", "Help me right now!"),
                                    ("c", "You must do this."),
                                    ("d", "Why are you standing there?"),
                                ],
                                ["a"],
                                "Could you please help me?",
                            ),
                            _match(
                                "Match the phrases with their meanings",
                                {
                                    "no problem": "you're welcome",
                                    "never mind": "don't worry about it",
                                    "catch you later": "see you soon",
                                    "make yourself at home": "feel comfortable here",
                                },
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "Where is the nearest train station",
                                [
                                    "Where",
                                    "is",
                                    "the",
                                    "nearest",
                                    "train",
                                    "station",
                                    "bus",
                                    "stop",
                                ],
                                [["Where", "is", "the", "nearest", "train", "station"]],
                                "Where is the nearest train station",
                            ),
                            _type(
                                "What is a polite response to 'Thank you'?",
                                ["you're welcome", "you are welcome", "no problem", "my pleasure"],
                                "you're welcome",
                                hint="Two words with an apostrophe",
                            ),
                        ],
                    },
                    {
                        "title": "Out and About",
                        "xp_reward": 15,
                        "exercises": [
                            _fill(
                                "Complete: Turn ___ at the next traffic light.",
                                ["Turn ", " at the next traffic light."],
                                ["left", "lefts", "leaving"],
                                "left",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "The weather is wonderful today",
                                [
                                    "The weather is wonderful today",
                                    "the weather is wonderful today",
                                ],
                                "The weather is wonderful today",
                                hint="Talking about sunny skies",
                            ),
                            _wb(
                                "Build the sentence",
                                "The library is across from the park",
                                ["The", "library", "is", "across", "from", "the", "park", "near"],
                                [["The", "library", "is", "across", "from", "the", "park"]],
                                "The library is across from the park",
                            ),
                            _match(
                                "Match the city locations",
                                {
                                    "airport": "where airplanes land",
                                    "bakery": "where fresh bread is made",
                                    "pharmacy": "where medicine is dispensed",
                                    "museum": "where history is displayed",
                                },
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 4,
                "title": "Listening Lab",
                "description": "Audio-only comprehension: train your ears",
                "icon": "headphones",
                "lessons": [
                    {
                        "title": "Audio Sprint 1",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_wb(
                                "Tap what you hear",
                                "Could I have the check please",
                                ["Could", "I", "have", "the", "check", "bill", "please", "water"],
                                [["Could", "I", "have", "the", "check", "please"]],
                                "Could I have the check please",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "I would like to order right now",
                                [
                                    "I would like to order right now",
                                    "i would like to order right now",
                                ],
                                "I would like to order right now",
                                hint="Ready at the restaurant",
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "The flight is delayed by thirty minutes",
                                [
                                    "The",
                                    "flight",
                                    "is",
                                    "delayed",
                                    "by",
                                    "thirty",
                                    "twenty",
                                    "minutes",
                                    "hours",
                                ],
                                [["The", "flight", "is", "delayed", "by", "thirty", "minutes"]],
                                "The flight is delayed by thirty minutes",
                            ),
                            _match(
                                "Match audio vocabulary",
                                {
                                    "rapid": "fast",
                                    "whisper": "speak very softly",
                                    "listen": "hear attentively",
                                    "echo": "sound that bounces back",
                                },
                            ),
                        ],
                    },
                    {
                        "title": "Audio Sprint 2",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_type(
                                "Type what you hear",
                                "What time does the concert begin tonight",
                                [
                                    "What time does the concert begin tonight",
                                    "what time does the concert begin tonight",
                                ],
                                "What time does the concert begin tonight",
                                hint="Asking about event timing",
                            ),
                            _speech_wb(
                                "Tap what you hear",
                                "We are traveling across Europe this summer",
                                [
                                    "We",
                                    "are",
                                    "traveling",
                                    "across",
                                    "Europe",
                                    "this",
                                    "summer",
                                    "winter",
                                    "staying",
                                ],
                                [["We", "are", "traveling", "across", "Europe", "this", "summer"]],
                                "We are traveling across Europe this summer",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "Please silence your mobile devices",
                                [
                                    "Please silence your mobile devices",
                                    "please silence your mobile devices",
                                ],
                                "Please silence your mobile devices",
                                hint="Announcement before a movie",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 5,
                "title": "Grammar Sprint",
                "description": "High-speed grammar drills and sentence puzzles",
                "icon": "⚡",
                "lessons": [
                    {
                        "title": "Fast Verbs & Patterns",
                        "xp_reward": 20,
                        "exercises": [
                            _mc(
                                "Choose the grammatically correct sentence:",
                                [
                                    ("a", "If I had known, I would have joined you."),
                                    ("b", "If I knew, I will join you."),
                                    ("c", "If I had knew, I would join you."),
                                    ("d", "If I know, I would have join you."),
                                ],
                                ["a"],
                                "If I had known, I would have joined you.",
                            ),
                            _match(
                                "Match the irregular past tense verbs",
                                {
                                    "buy": "bought",
                                    "catch": "caught",
                                    "freeze": "froze",
                                    "speak": "spoke",
                                },
                            ),
                            _fill(
                                "Subject-verb: Neither the manager nor the employees ___ present.",
                                ["Neither the manager nor the employees ", " present."],
                                ["were", "was", "is"],
                                "were",
                            ),
                            _type(
                                "Type the past participle of 'write'",
                                ["written"],
                                "written",
                                hint="irregular past participle",
                            ),
                        ],
                    },
                    {
                        "title": "Sentence Puzzle Master",
                        "xp_reward": 25,
                        "exercises": [
                            _wb(
                                "Build the complex sentence",
                                "Although it rained heavily they finished the marathon",
                                [
                                    "Although",
                                    "it",
                                    "rained",
                                    "heavily",
                                    "they",
                                    "finished",
                                    "the",
                                    "marathon",
                                    "because",
                                ],
                                [
                                    [
                                        "Although",
                                        "it",
                                        "rained",
                                        "heavily",
                                        "they",
                                        "finished",
                                        "the",
                                        "marathon",
                                    ]
                                ],
                                "Although it rained heavily they finished the marathon",
                            ),
                            _match(
                                "Match phrasal verbs with their definitions",
                                {
                                    "look forward to": "anticipate with pleasure",
                                    "run out of": "deplete the supply of",
                                    "call off": "cancel an event",
                                    "figure out": "solve or understand",
                                },
                            ),
                            _type(
                                "What is the opposite of 'frequent'?",
                                ["rare", "infrequent", "seldom"],
                                "rare",
                                hint="Happens very uncommonly",
                            ),
                        ],
                    },
                ],
            },
        ],
    },
    {
        "order": 2,
        "title": "Grammar & Beyond",
        "description": "Verbs, questions, adventures, and sound studio",
        "banner_color": "#ce82ff",
        "skills": [
            {
                "order": 1,
                "title": "Verbs",
                "description": "Present, past, and continuous forms",
                "icon": "🏃",
                "lessons": [
                    {
                        "title": "Present tense",
                        "xp_reward": 15,
                        "exercises": [
                            _mc(
                                "She ___ to school every single day.",
                                [("a", "walk"), ("b", "walks"), ("c", "walking"), ("d", "walked")],
                                ["b"],
                                "walks",
                            ),
                            _wb(
                                "Build the sentence",
                                "He plays football on Saturdays",
                                ["He", "plays", "football", "on", "Saturdays", "play", "the"],
                                [["He", "plays", "football", "on", "Saturdays"]],
                                "He plays football on Saturdays",
                            ),
                            _type(
                                "Type the past tense of 'go'",
                                ["went"],
                                "went",
                                prompt_sentence="go",
                                hint="An irregular past verb",
                            ),
                        ],
                    },
                    {
                        "title": "Action Verbs",
                        "xp_reward": 15,
                        "exercises": [
                            _match(
                                "Match action verbs with activities",
                                {
                                    "swim": "in a pool",
                                    "climb": "a steep mountain",
                                    "drive": "a motor vehicle",
                                    "paint": "a canvas picture",
                                },
                            ),
                            _fill(
                                "Complete: They have been ___ for three hours.",
                                ["They have been ", " for three hours."],
                                ["studying", "studied", "studies"],
                                "studying",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 2,
                "title": "Questions",
                "description": "Ask questions confidently",
                "icon": "❓",
                "lessons": [
                    {
                        "title": "Asking questions",
                        "xp_reward": 20,
                        "exercises": [
                            _fill(
                                "Complete the question",
                                ["___", " you like green tea?"],
                                ["Do", "Does", "Is"],
                                "Do",
                            ),
                            _match(
                                "Match question words with their purpose",
                                {
                                    "who": "identifies a person",
                                    "where": "identifies a place",
                                    "when": "identifies a time",
                                    "why": "identifies a reason",
                                },
                            ),
                            _type(
                                "Which question word asks about a place?",
                                ["where"],
                                "where",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 3,
                "title": "Adventures",
                "description": "Travel, maps, and exploration",
                "icon": "🗺️",
                "lessons": [
                    {
                        "title": "Exploring the World",
                        "xp_reward": 15,
                        "exercises": [
                            _match(
                                "Match adventure terms",
                                {
                                    "compass": "shows direction",
                                    "passport": "allows international travel",
                                    "backpack": "holds your gear",
                                    "trail": "path through nature",
                                },
                            ),
                            _wb(
                                "Build the sentence",
                                "We climbed to the mountain summit",
                                [
                                    "We",
                                    "climbed",
                                    "to",
                                    "the",
                                    "mountain",
                                    "summit",
                                    "walked",
                                    "sea",
                                ],
                                [["We", "climbed", "to", "the", "mountain", "summit"]],
                                "We climbed to the mountain summit",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 4,
                "title": "Sound Studio",
                "description": "Advanced auditory challenge and dialogue",
                "icon": "headphones",
                "lessons": [
                    {
                        "title": "Sound Stage 1",
                        "xp_reward": 20,
                        "exercises": [
                            _speech_wb(
                                "Tap what you hear",
                                "Practice makes perfect in every language",
                                [
                                    "Practice",
                                    "makes",
                                    "perfect",
                                    "in",
                                    "every",
                                    "language",
                                    "always",
                                    "word",
                                ],
                                [["Practice", "makes", "perfect", "in", "every", "language"]],
                                "Practice makes perfect in every language",
                            ),
                            _speech_type(
                                "Type what you hear",
                                "The early bird catches the worm",
                                [
                                    "The early bird catches the worm",
                                    "the early bird catches the worm",
                                ],
                                "The early bird catches the worm",
                                hint="A famous English proverb",
                            ),
                        ],
                    },
                ],
            },
            {
                "order": 5,
                "title": "Mastery Sprint",
                "description": "Reach the summit of Unit 2",
                "icon": "🎓",
                "lessons": [
                    {
                        "title": "Grand Mastery",
                        "xp_reward": 25,
                        "exercises": [
                            _wb(
                                "Build the sentence",
                                "Knowledge and persistence open every door",
                                [
                                    "Knowledge",
                                    "and",
                                    "persistence",
                                    "open",
                                    "every",
                                    "door",
                                    "shut",
                                    "window",
                                ],
                                [["Knowledge", "and", "persistence", "open", "every", "door"]],
                                "Knowledge and persistence open every door",
                            ),
                            _match(
                                "Match idioms with meanings",
                                {
                                    "piece of cake": "very easy task",
                                    "once in a blue moon": "very rarely",
                                    "break a leg": "good luck",
                                    "under the weather": "feeling slightly ill",
                                },
                            ),
                        ],
                    },
                ],
            },
        ],
    },
]

_COURSES: list[dict] = [
    {
        "code": "fr",
        "title": "French",
        "description": "Learn French: greetings, food, animals, and simple sentences.",
        "flag_icon": "🇫🇷",
        "speech_locale": "fr-FR",
        "units": _FRENCH_UNITS,
    },
    {
        "code": "en",
        "title": "English",
        "description": "Sharpen your English: everyday words, grammar, and questions.",
        "flag_icon": "🇬🇧",
        "speech_locale": "en-US",
        "units": _ENGLISH_UNITS,
    },
]
