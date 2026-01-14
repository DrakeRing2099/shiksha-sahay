# IMPORTANT:
# This file must import ALL models so Alembic can detect them
# Do not add logic here.

from app.models.core import (  # noqa: F401
    School, Grade, Subject, Solution,
    Language, TeacherLanguage,  
    Teacher, TeacherStyle, TeacherClassSubject, TeacherPastGrade, TeacherPastSubject,
    TeacherSolutionOutcome,
    Session, SessionFeedback,
)

