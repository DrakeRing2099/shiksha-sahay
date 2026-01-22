"""extend teaching insights schema

Revision ID: 8e6bbb4e5bd2
Revises: a5d4d8972e85
Create Date: 2026-01-22 02:04:19.976618

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8e6bbb4e5bd2'
down_revision: Union[str, Sequence[str], None] = 'a5d4d8972e85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to teaching_insights
    op.add_column(
        "teaching_insights",
        sa.Column("title", sa.Text(), nullable=False),
    )

    op.add_column(
        "teaching_insights",
        sa.Column("grade", sa.Integer(), nullable=True),
    )

    op.add_column(
        "teaching_insights",
        sa.Column("subject", sa.Text(), nullable=True),
    )

    op.add_column(
        "teaching_insights",
        sa.Column("language", sa.Text(), nullable=True),
    )

    op.add_column(
        "teaching_insights",
        sa.Column(
            "likes_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )


def downgrade() -> None:
    # Reverse order for safety
    op.drop_column("teaching_insights", "likes_count")
    op.drop_column("teaching_insights", "language")
    op.drop_column("teaching_insights", "subject")
    op.drop_column("teaching_insights", "grade")
    op.drop_column("teaching_insights", "title")
