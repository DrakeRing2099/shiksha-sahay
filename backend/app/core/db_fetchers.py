from __future__ import annotations
from typing import Optional, Type, TypeVar
from sqlalchemy.orm import Session

T = TypeVar("T")

def first_by_id(db: Session, model: Type[T], id_value) -> Optional[T]:
    return db.query(model).filter(model.id == id_value).first()

def first_by_field(db: Session, model: Type[T], field, value) -> Optional[T]:
    return db.query(model).filter(field == value).first()

def all_by_field(db: Session, model: Type[T], field, value) -> list[T]:
    return db.query(model).filter(field == value).all()
