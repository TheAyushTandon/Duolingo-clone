"""add course speech locale and user active course

Revision ID: a8d21f4e7c90
Revises: 1fe05c553bc2
Create Date: 2026-09-07 20:15:00.000000
"""
from __future__ import annotations

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a8d21f4e7c90'
down_revision: Union[str, None] = '1fe05c553bc2'
branch_labels: Union[str, Sequence[str] | None] = None
depends_on: Union[str, Sequence[str] | None] = None


def upgrade() -> None:
    with op.batch_alter_table('courses') as batch_op:
        batch_op.add_column(sa.Column('speech_locale', sa.String(length=16), nullable=True))

    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('active_course_id', sa.String(), nullable=True))
        batch_op.create_foreign_key(
            'fk_users_active_course',
            'courses',
            ['active_course_id'],
            ['id'],
            ondelete='SET NULL',
        )


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_constraint('fk_users_active_course', type_='foreignkey')
        batch_op.drop_column('active_course_id')

    with op.batch_alter_table('courses') as batch_op:
        batch_op.drop_column('speech_locale')
