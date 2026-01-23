import argparse
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.core import (
    Grade,
    Language,
    School,
    Session,
    SessionFeedback,
    Solution,
    SolutionOutcome,
    Subject,
    Teacher,
    TeacherClassSubject,
    TeacherLanguage,
    TeacherPastGrade,
    TeacherPastSubject,
    TeacherSolutionOutcome,
    TeacherStyle,
)


def get_or_create(db, model, defaults=None, **kwargs):
    instance = db.execute(select(model).filter_by(**kwargs)).scalar_one_or_none()
    if instance:
        return instance, False
    params = dict(kwargs)
    if defaults:
        params.update(defaults)
    instance = model(**params)
    db.add(instance)
    db.flush()
    return instance, True


def main():
    parser = argparse.ArgumentParser(description="Seed the database with sample data.")
    parser.add_argument(
        "--create-schema",
        action="store_true",
        help="Create tables if they don't exist (useful for fresh DBs).",
    )
    args = parser.parse_args()

    if args.create_schema:
        Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        schools = []
        for name in ["Kendriya Vidyalaya No. 1", "GHS Andheri", "St. Mary's HS"]:
            school, _ = get_or_create(db, School, name=name)
            schools.append(school)

        for grade_id in range(1, 13):
            get_or_create(db, Grade, id=grade_id, defaults={"label": f"Grade {grade_id}"})

        subjects = []
        for name in ["Mathematics", "Science", "English", "Social Studies"]:
            subject, _ = get_or_create(db, Subject, name=name)
            subjects.append(subject)

        solutions = []
        for title, description in [
            ("Think-Pair-Share", "Students think individually, discuss in pairs, then share."),
            ("Exit Ticket", "Short reflection or quiz at end of class."),
        ]:
            solution, _ = get_or_create(
                db,
                Solution,
                title=title,
                defaults={"description": description},
            )
            solutions.append(solution)

        languages = []
        for name in ["English", "Hindi", "Marathi"]:
            language, _ = get_or_create(db, Language, name=name)
            languages.append(language)

        teacher, _ = get_or_create(
            db,
            Teacher,
            email="arjun.mehta@example.edu",
            defaults={
                "name": "Arjun Mehta",
                "phone": "+91-90000-00001",
                "language": "English",
                "years_experience": 6,
                "school_id": schools[0].id,
            },
        )

        get_or_create(
            db,
            TeacherStyle,
            teacher_id=teacher.id,
            defaults={
                "interactive_vs_passive": 7,
                "light_vs_strict": 4,
                "conventional_vs_modern": 6,
                "description": "Interactive, mildly strict, mixes modern methods.",
            },
        )

        for language in languages[:2]:
            get_or_create(
                db,
                TeacherLanguage,
                teacher_id=teacher.id,
                language_id=language.id,
            )

        grade_6 = db.execute(select(Grade).filter_by(id=6)).scalar_one()
        grade_7 = db.execute(select(Grade).filter_by(id=7)).scalar_one()
        math = next(s for s in subjects if s.name == "Mathematics")
        science = next(s for s in subjects if s.name == "Science")

        get_or_create(
            db,
            TeacherClassSubject,
            teacher_id=teacher.id,
            grade_id=grade_6.id,
            subject_id=math.id,
        )
        get_or_create(
            db,
            TeacherClassSubject,
            teacher_id=teacher.id,
            grade_id=grade_7.id,
            subject_id=science.id,
        )

        get_or_create(db, TeacherPastGrade, teacher_id=teacher.id, grade_id=5)
        get_or_create(db, TeacherPastSubject, teacher_id=teacher.id, subject_id=math.id)

        for solution in solutions:
            get_or_create(
                db,
                TeacherSolutionOutcome,
                teacher_id=teacher.id,
                solution_id=solution.id,
                defaults={"outcome": SolutionOutcome.worked},
            )

        teaching_session, _ = get_or_create(
            db,
            Session,
            teacher_id=teacher.id,
            defaults={
                "started_at": datetime.now(tz=timezone.utc) - timedelta(hours=1),
                "ended_at": datetime.now(tz=timezone.utc),
                "duration_sec": 3600,
                "grade": 6,
                "subject": "Mathematics",
                "language": "English",
                "device": "tablet",
                "notes": "Used exit ticket at the end.",
            },
        )

        get_or_create(
            db,
            SessionFeedback,
            session_id=teaching_session.id,
            defaults={
                "summary": "Strong engagement; pacing worked well.",
                "observations": [
                    "Most students participated in the pair discussion.",
                    "Time management improved from last session.",
                ],
                "suggestions": [
                    "Add one more conceptual check during the middle.",
                    "Rotate pairs to mix proficiency levels.",
                ],
                "reflection_prompt": "Which activity got the most questions today?",
                "generated_by": "seed",
            },
        )

        db.commit()

    print("Seed data inserted.")


if __name__ == "__main__":
    main()
