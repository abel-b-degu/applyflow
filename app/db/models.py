from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import relationship


Base = declarative_base()


class ApplicationStatus(str, PyEnum):
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(200), nullable=False)
    role_title = Column(String(200), nullable=False)
    job_url = Column(String(500), nullable=True)

    status = Column(
        Enum(ApplicationStatus),
        default=ApplicationStatus.APPLIED,
        nullable=False
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

class JobPost(Base):
    __tablename__ = "job_posts"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True, nullable=False)

    raw_text = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    application = relationship("Application", backref="job_post")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"),nullable=False)

    doc_type = Column(String(50), nullable=False) # cover letter
    content = Column(Text, nullable = False)

    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", backref="documents")
    