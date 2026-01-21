"""merge heads

Revision ID: 7b4ad2c7ebfb
Revises: 15264f3df5b6, d38e0e922ecd
Create Date: 2026-01-21 17:58:32.032757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b4ad2c7ebfb'
down_revision: Union[str, Sequence[str], None] = ('15264f3df5b6', 'd38e0e922ecd')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
