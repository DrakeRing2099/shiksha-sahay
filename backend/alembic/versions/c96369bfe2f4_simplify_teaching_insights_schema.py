"""simplify teaching_insights schema

Revision ID: c96369bfe2f4
Revises: 8e6bbb4e5bd2
Create Date: 2026-01-22 02:45:44.823168

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c96369bfe2f4'
down_revision: Union[str, Sequence[str], None] = '8e6bbb4e5bd2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("teaching_insights", "grade")
    op.drop_column("teaching_insights", "subject")
    op.drop_column("teaching_insights", "language")


def downgrade() -> None:
    op.add_column("teaching_insights", sa.Column("grade", sa.Integer()))
    op.add_column("teaching_insights", sa.Column("subject", sa.Text()))
    op.add_column("teaching_insights", sa.Column("language", sa.Text()))
