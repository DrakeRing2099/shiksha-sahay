from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.core import School

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("")
def list_schools(db: Session = Depends(get_db)):
    """
    Public endpoint.
    Returns list of schools for onboarding.
    """
    schools = (
        db.query(School)
        .order_by(School.name)
        .all()
    )

    return [
        {
            "id": str(s.id),
            "name": s.name,
            "location": s.location,
        }
        for s in schools
    ]
