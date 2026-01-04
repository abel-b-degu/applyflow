from pydantic import BaseModel, Field
from datetime import datetime

class JobPostCreate(BaseModel):
    raw_text: str = Field(min_length=20)

class JobPostOut(BaseModel):
    id: int
    application_id: int
    raw_text: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

   