"""add dummy schools

Revision ID: 12bf7ba0df62
Revises: ead9c0bbfefb
Create Date: 2026-01-20 15:44:19.553179

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision: str = '12bf7ba0df62'
down_revision: Union[str, Sequence[str], None] = 'ead9c0bbfefb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    schools_table = sa.table(
        "schools",
        sa.column("id", postgresql.UUID),
        sa.column("name", sa.Text),
        sa.column("location", sa.Text),
    )

    op.bulk_insert(
        schools_table,
        [
            {
                "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                "name": "Delhi Public School",
                "location": "Delhi",
            },
            {
                "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                "name": "Kendriya Vidyalaya",
                "location": "Ahmedabad, Gujarat",
            },
            {
                "id": uuid.UUID("33333333-3333-3333-3333-333333333333"),
                "name": "St. Xavier High School",
                "location": "Mumbai, Maharashtra",
            },
            {
                "id": uuid.UUID("44444444-4444-4444-4444-444444444444"),
                "name": "Navodaya Vidyalaya",
                "location": "Jaipur, Rajasthan",
            },
            {
                "id": uuid.UUID("55555555-5555-5555-5555-555555555555"),
                "name": "Government Model School",
                "location": "Bhopal, Madhya Pradesh",
            },
        ],
    )


def downgrade():
    op.execute(
        """
        DELETE FROM schools
        WHERE id IN (
          '11111111-1111-1111-1111-111111111111',
          '22222222-2222-2222-2222-222222222222',
          '33333333-3333-3333-3333-333333333333',
          '44444444-4444-4444-4444-444444444444',
          '55555555-5555-5555-5555-555555555555'
        )
        """
    )