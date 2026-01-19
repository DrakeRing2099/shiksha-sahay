# app/models/auth.py
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum as SAEnum, ForeignKey, Integer, Text, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class OTPChannel(enum.Enum):
    phone = "phone"
    email = "email"


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)

    channel = Column(SAEnum(OTPChannel, name="otp_channel"), nullable=False)
    destination = Column(Text, nullable=False)  # phone or email

    otp_hash = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    attempts = Column(Integer, nullable=False, server_default="0")
    used_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_otp_codes_teacher_created", "teacher_id", "created_at"),
        Index("ix_otp_codes_destination_created", "destination", "created_at"),
    )


class AuthSession(Base):
    """
    Optional but recommended: refresh-token based sessions (lets you logout properly).
    """
    __tablename__ = "auth_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)

    refresh_token_hash = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_auth_sessions_teacher_created", "teacher_id", "created_at"),
    )
