"""User progress data access: skill progress, achievements, activity, XP."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement, UserAchievement
from app.models.attempt import LessonAttempt
from app.models.gamification import UserActivity, XPTransaction
from app.models.progress import UserSkillProgress


class ProgressRepository:
    # ------------------------------------------------- skill progress -------

    def get_skill_progress(
        self, db: Session, user_id: str, skill_id: str
    ) -> UserSkillProgress | None:
        stmt = select(UserSkillProgress).where(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == skill_id,
        )
        return db.scalar(stmt)

    def get_all_skill_progress(self, db: Session, user_id: str) -> dict[str, UserSkillProgress]:
        stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
        return {progress.skill_id: progress for progress in db.scalars(stmt)}

    def upsert_skill_progress(self, db: Session, user_id: str, skill_id: str) -> UserSkillProgress:
        progress = self.get_skill_progress(db, user_id, skill_id)
        if progress is None:
            progress = UserSkillProgress(
                user_id=user_id,
                skill_id=skill_id,
                level=1,
                progress_percentage=0,
                is_completed=False,
            )
            db.add(progress)
        return progress

    # ------------------------------------------------------- activity -------

    def get_activity(
        self, db: Session, user_id: str, activity_date: dt.date
    ) -> UserActivity | None:
        stmt = select(UserActivity).where(
            UserActivity.user_id == user_id,
            UserActivity.activity_date == activity_date,
        )
        return db.scalar(stmt)

    def upsert_activity(self, db: Session, user_id: str, activity_date: dt.date) -> UserActivity:
        activity = self.get_activity(db, user_id, activity_date)
        if activity is None:
            activity = UserActivity(
                user_id=user_id, activity_date=activity_date, xp_earned=0, lessons_completed=0
            )
            db.add(activity)
        return activity

    def list_activity_page(
        self, db: Session, user_id: str, limit: int, before_date: dt.date | None
    ) -> list[UserActivity]:
        """Keyset pagination over activity dates, newest first."""
        stmt = select(UserActivity).where(UserActivity.user_id == user_id)
        if before_date is not None:
            stmt = stmt.where(UserActivity.activity_date < before_date)
        stmt = stmt.order_by(UserActivity.activity_date.desc()).limit(limit)
        return list(db.scalars(stmt))

    # ------------------------------------------------- achievements ---------

    def get_achievements(self, db: Session) -> list[Achievement]:
        stmt = select(Achievement).order_by(Achievement.created_at)
        return list(db.scalars(stmt))

    def get_unlocked_achievements(self, db: Session, user_id: str) -> dict[str, UserAchievement]:
        stmt = select(UserAchievement).where(UserAchievement.user_id == user_id)
        return {unlock.achievement_id: unlock for unlock in db.scalars(stmt)}

    def add_user_achievement(
        self, db: Session, user_id: str, achievement_id: str
    ) -> UserAchievement:
        unlock = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            unlocked_at=dt.datetime.now(dt.UTC),
        )
        db.add(unlock)
        return unlock

    # --------------------------------------------------- XP transactions ----

    def get_xp_transaction_by_reference(
        self,
        db: Session,
        user_id: str,
        reason: str,
        reference_type: str | None,
        reference_id: str | None,
    ) -> XPTransaction | None:
        stmt = select(XPTransaction).where(
            XPTransaction.user_id == user_id,
            XPTransaction.reason == reason,
            XPTransaction.reference_type == reference_type,
            XPTransaction.reference_id == reference_id,
        )
        return db.scalar(stmt)

    def add_xp_transaction(self, db: Session, transaction: XPTransaction) -> XPTransaction:
        db.add(transaction)
        return transaction

    def sum_xp_since(self, db: Session, user_id: str, since: dt.datetime) -> int:
        stmt = select(func.coalesce(func.sum(XPTransaction.amount), 0)).where(
            XPTransaction.user_id == user_id,
            XPTransaction.created_at >= since,
        )
        return int(db.scalar(stmt) or 0)

    # ---------------------------------------------------- user stats --------

    def count_completed_attempts(self, db: Session, user_id: str) -> int:
        stmt = (
            select(func.count())
            .select_from(LessonAttempt)
            .where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == "COMPLETED",
            )
        )
        return int(db.scalar(stmt) or 0)

    def count_completed_skills(self, db: Session, user_id: str) -> int:
        stmt = (
            select(func.count())
            .select_from(UserSkillProgress)
            .where(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.is_completed.is_(True),
            )
        )
        return int(db.scalar(stmt) or 0)

    def count_unlocked_achievements(self, db: Session, user_id: str) -> int:
        stmt = (
            select(func.count())
            .select_from(UserAchievement)
            .where(UserAchievement.user_id == user_id)
        )
        return int(db.scalar(stmt) or 0)
