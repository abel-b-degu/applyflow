from pydantic import BaseModel, HttpUrl, Field
from enum import Enum
from datetime import datetime


class ApplicationStatus(str, Enum):
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    role_title: str = Field(min_length=1, max_length=200)
    job_url: HttpUrl | None = None


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(BaseModel):
    id: int
    company: str
    role_title: str
    job_url: str | None
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
