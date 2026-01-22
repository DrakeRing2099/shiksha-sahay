from pydantic import BaseModel
from typing import Optional


class ConversationFeedbackRequest(BaseModel):
    worked: bool
    notes: Optional[str] = None
