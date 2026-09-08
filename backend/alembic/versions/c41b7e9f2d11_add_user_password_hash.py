"""add user password hash

Revision ID: c41b7e9f2d11
Revises: a8d21f4e7c90
Create Date: 2026-09-08 10:00:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c41b7e9f2d11'
down_revision: Union[str, None] = 'a8d21f4e7c90'
branch_labels: Union[str, Sequence[str] | None] = None
depends_on: Union[str, Sequence[str] | None] = None


def upgrade() -> None:
    # Column may already exist if the app previously ran the ad-hoc
    # ALTER TABLE fallback; guard so migration stays idempotent on such
    # databases. Alembic cannot IF NOT EXISTS via batch_alter_table on
    # SQLite reliably, so introspect first.
    conn = op.get_bind()
    columns = [row[1] for row in conn.execute(sa.text("PRAGMA table_info(users)"))]
    if "password_hash" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(sa.Column("password_hash", sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("password_hash")
