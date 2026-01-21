"""add title and updated_at to conversations

Revision ID: a5d4d8972e85
Revises: d872378fd96d
Create Date: 2026-01-22 00:34:29.006110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a5d4d8972e85'
down_revision: Union[str, Sequence[str], None] = 'd872378fd96d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1️⃣ Add title with temporary default for existing rows
    op.add_column(
        "conversations",
        sa.Column(
            "title",
            sa.Text(),
            nullable=False,
            server_default="New Conversation"
        )
    )

    # 2️⃣ Add updated_at
    op.add_column(
        "conversations",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()")
        )
    )

    # 3️⃣ Remove default after backfill
    op.alter_column("conversations", "title", server_default=None)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    
    op.drop_column("conversations", "updated_at")
    op.drop_column("conversations", "title")
    # ### end Alembic commands ###
