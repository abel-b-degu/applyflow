from pydantic import BaseModel
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    application_id: int
    doc_type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
