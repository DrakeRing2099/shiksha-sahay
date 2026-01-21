"""simplify teaching_insights schema

Revision ID: efcf14fe07cf
Revises: c96369bfe2f4
Create Date: 2026-01-22 03:51:02.042429

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efcf14fe07cf'
down_revision: Union[str, Sequence[str], None] = 'c96369bfe2f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
