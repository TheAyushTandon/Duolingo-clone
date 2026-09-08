import os
import sys

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import delete, select

from app.core.database import SessionLocal
from app.models import (
    ExerciseAttempt,
    LessonAttempt,
    User,
    UserAchievement,
    UserActivity,
    UserSkillProgress,
    XPTransaction,
)

TARGET_USERNAMES = [
    "demo_learner",
    "testuser123",
    "u_19d25347",
    "u_398f19f3",
    "u_3efe88c3",
    "u_fd1108ed",
    "ayushtandon2005@gmail.com",
    "mrigank",
    "u_1f8ae098",
    "u_a10197f1",
    "u_e2335073",
    "u_e61e74fa",
]


def clean_users():
    with SessionLocal() as db:
        users_to_delete = db.scalars(select(User).where(User.username.in_(TARGET_USERNAMES))).all()

        if not users_to_delete:
            print("No matching users found to delete.")
            return

        user_ids = [u.id for u in users_to_delete]
        user_names = [u.username for u in users_to_delete]
        print(f"Deleting {len(user_ids)} users: {user_names}")

        lesson_attempt_ids = db.scalars(
            select(LessonAttempt.id).where(LessonAttempt.user_id.in_(user_ids))
        ).all()

        if lesson_attempt_ids:
            res = db.execute(
                delete(ExerciseAttempt).where(
                    ExerciseAttempt.lesson_attempt_id.in_(lesson_attempt_ids)
                )
            )
            print(f"Deleted {res.rowcount} exercise attempts.")

            res = db.execute(delete(LessonAttempt).where(LessonAttempt.id.in_(lesson_attempt_ids)))
            print(f"Deleted {res.rowcount} lesson attempts.")

        res = db.execute(delete(XPTransaction).where(XPTransaction.user_id.in_(user_ids)))
        print(f"Deleted {res.rowcount} XP transactions.")

        res = db.execute(delete(UserActivity).where(UserActivity.user_id.in_(user_ids)))
        print(f"Deleted {res.rowcount} user activities.")

        res = db.execute(delete(UserSkillProgress).where(UserSkillProgress.user_id.in_(user_ids)))
        print(f"Deleted {res.rowcount} user skill progress entries.")

        res = db.execute(delete(UserAchievement).where(UserAchievement.user_id.in_(user_ids)))
        print(f"Deleted {res.rowcount} user achievements.")

        res = db.execute(delete(User).where(User.id.in_(user_ids)))
        print(f"Deleted {res.rowcount} users.")

        db.commit()

        remaining_users = db.scalars(select(User)).all()
        print(f"Remaining users in database: {[u.username for u in remaining_users]}")


if __name__ == "__main__":
    clean_users()
