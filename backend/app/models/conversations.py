import uuid
from sqlalchemy import (
    Column,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from app.db.base import Base


# =====================================================
# Conversation (user-linked, private)
# =====================================================

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False
    )

    # existing columns
    raw_query = Column(Text, nullable=False)
    resolved_context = Column(JSONB, nullable=False)
    ai_response = Column(Text, nullable=False)

    # feedback
    worked = Column(Boolean, nullable=True)

    # 🆕 added columns
    title = Column(Text, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


# =====================================================
# Teaching Insight (global, anonymized)
# =====================================================

class TeachingInsight(Base):
    """
    A generalized, anonymized teaching insight extracted
    from a successful conversation.
    """

    __tablename__ = "teaching_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 🔑 Human-readable card title
    title = Column(Text, nullable=False)

    # Generalized context (NO teacher identifiers)
    generalized_context = Column(JSONB, nullable=False)

    reframed_problem = Column(Text, nullable=False)
    reframed_solution = Column(Text, nullable=False)

    # Engagement metrics (no ranking yet)
    likes_count = Column(Integer, nullable=False, server_default="0")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


# =====================================================
# Teaching Insight Reaction (like / dislike)
# =====================================================

class TeachingInsightReaction(Base):
    """
    Stores like / dislike feedback on TeachingInsights.
    One reaction per teacher per insight.
    """

    __tablename__ = "teaching_insight_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teaching_insight_id = Column(
        UUID(as_uuid=True),
        ForeignKey("teaching_insights.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    liked = Column(Boolean, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "teaching_insight_id",
            "teacher_id",
            name="uq_teacher_insight_reaction_once",
        ),
    )
