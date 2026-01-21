from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models.core import *   # noqa
from app.models.auth import *   # noqa
from app.models.conversations import *   # noqa