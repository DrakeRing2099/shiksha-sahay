import uuid
import enum

from sqlalchemy import (
    Column, Text, Integer, DateTime, ForeignKey, Enum as SAEnum,
    UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base


# -----------------------
# Existing (fix typo)
# -----------------------
class BlockType(enum.Enum):
    raw = "raw"
    explanation = "explanation"  # fix spelling
    question = "question"
    student = "student"
    pause = "pause"
    other = "other"


# -----------------------
# New enums
# -----------------------
class SolutionOutcome(enum.Enum):
    worked = "worked"
    failed = "failed"


# -----------------------
# Catalog tables
# -----------------------
class School(Base):
    __tablename__ = "schools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False, unique=True)

    location = Column(Text, nullable=True)  # ✅ School Location

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)



class Grade(Base):
    """
    Represents a class/grade (e.g., 1..12).
    """
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True)  # simple stable key: 1..12
    label = Column(Text, nullable=False, unique=True)  # e.g., "Grade 6"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False, unique=True)  # e.g., "Mathematics"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Solution(Base):
    __tablename__ = "solutions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


# -----------------------
# Teacher tables
# -----------------------
class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(Text, nullable=False)

    # ✅ required contact fields
    email = Column(Text, nullable=False, unique=True)
    phone = Column(Text, nullable=False, unique=True)  # store as text (keeps leading 0, +91 etc.)

    years_experience = Column(Integer, nullable=True)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"), nullable=True)

    onboarding_status = Column(Integer, nullable=False, server_default="0")  # 0/1 (bool-ish)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("years_experience IS NULL OR years_experience >= 0",
                        name="ck_teacher_years_experience_nonneg"),
    )

    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(Text, nullable=False)               # "Name"
    language = Column(Text, nullable=True)            # preferred language
    years_experience = Column(Integer, nullable=True) # "Years of Experience"

    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("years_experience IS NULL OR years_experience >= 0", name="ck_teacher_years_experience_nonneg"),
    )


class TeacherStyle(Base):
    __tablename__ = "teacher_styles"

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), primary_key=True)

    interactive_vs_passive = Column(Integer, nullable=False, default=5)
    light_vs_strict = Column(Integer, nullable=False, default=5)
    conventional_vs_modern = Column(Integer, nullable=False, default=5)

    description = Column(Text, nullable=True)  # ✅ optional extra notes

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("interactive_vs_passive BETWEEN 0 AND 10", name="ck_style_interactive_0_10"),
        CheckConstraint("light_vs_strict BETWEEN 0 AND 10", name="ck_style_light_strict_0_10"),
        CheckConstraint("conventional_vs_modern BETWEEN 0 AND 10", name="ck_style_conv_modern_0_10"),
    )


class TeacherClassSubject(Base):
    """
    The registered class-subject pairs a teacher teaches.
    (This is your “Class-Subject Pairs multiple select” requirement.)
    """
    __tablename__ = "teacher_class_subject"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    grade_id = Column(Integer, ForeignKey("grades.id", ondelete="RESTRICT"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False)

    # optional details you mentioned: “details store hongi class ke table me”
    # keep it extensible; avoid JSON unless you have to.
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("teacher_id", "grade_id", "subject_id", name="uq_teacher_grade_subject"),
    )


class TeacherPastGrade(Base):
    """
    Classes taught in past (history).
    """
    __tablename__ = "teacher_past_grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    grade_id = Column(Integer, ForeignKey("grades.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        UniqueConstraint("teacher_id", "grade_id", name="uq_teacher_past_grade"),
    )


class TeacherPastSubject(Base):
    """
    Subjects taught in past (history).
    """
    __tablename__ = "teacher_past_subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        UniqueConstraint("teacher_id", "subject_id", name="uq_teacher_past_subject"),
    )


class TeacherSolutionOutcome(Base):
    """
    Stores which solutions worked/failed for a teacher.
    Replaces "solution IDs that worked" arrays.
    """
    __tablename__ = "teacher_solution_outcomes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    solution_id = Column(UUID(as_uuid=True), ForeignKey("solutions.id", ondelete="CASCADE"), nullable=False)

    outcome = Column(SAEnum(SolutionOutcome, name="solution_outcome"), nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("teacher_id", "solution_id", name="uq_teacher_solution_once"),
    )


# -----------------------
# Your existing tables (recommendation: normalize Session too)
# -----------------------
class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)

    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_sec = Column(Integer, nullable=True)

    # Normalize these later by referencing grade_id + subject_id if you want clean analytics
    grade = Column(Integer, nullable=True)
    subject = Column(Text, nullable=True)
    language = Column(Text, nullable=True)
    device = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class SessionFeedback(Base):
    __tablename__ = "session_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, unique=True)

    summary = Column(Text, nullable=True)

    observations = Column(JSONB, nullable=False, server_default="[]")
    suggestions = Column(JSONB, nullable=False, server_default="[]")
    reflection_prompt = Column(Text, nullable=True)

    generated_by = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __tablename__ = "session_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, unique=True)

    summary = Column(Text, nullable=True)

    # IMPORTANT: rename observation -> observations (array). JSONB is ok here because it's generated text bullets.
    # But if you want strict normalization, you can store bullets in a separate table later.
    observations = Column(Text, nullable=True)  # simplest for now; or keep JSONB if you want
    suggestions = Column(Text, nullable=True)
    reflection_prompt = Column(Text, nullable=True)

    generated_by = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Language(Base):
    __tablename__ = "languages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False, unique=True)  # e.g., "English", "Hindi"
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class TeacherLanguage(Base):
    __tablename__ = "teacher_languages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    language_id = Column(UUID(as_uuid=True), ForeignKey("languages.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        UniqueConstraint("teacher_id", "language_id", name="uq_teacher_language"),
    )
