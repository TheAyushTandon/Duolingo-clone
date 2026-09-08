"""add user daily goal

Revision ID: e5c2a8f90134
Revises: c41b7e9f2d11
Create Date: 2026-09-08 12:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e5c2a8f90134'
down_revision: Union[str, None] = 'c41b7e9f2d11'
branch_labels: Union[str, Sequence[str] | None] = None
depends_on: Union[str, Sequence[str] | None] = None


def upgrade() -> None:
    conn = op.get_bind()
    columns = [row[1] for row in conn.execute(sa.text("PRAGMA table_info(users)"))]
    if "daily_goal_xp" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(
                sa.Column("daily_goal_xp", sa.Integer(), nullable=False, server_default="50")
            )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("daily_goal_xp")
