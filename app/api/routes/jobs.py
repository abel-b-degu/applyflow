from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.db.models import Application, JobPost
from app.schemas.jobs import JobPostCreate, JobPostOut

router = APIRouter(prefix="/applications", tags=["job_description"])


@router.post("/{app_id}/job", response_model=JobPostOut, status_code=201)
def add_or_update_job_description(app_id: int, payload: JobPostCreate, db: Session = Depends(get_db)):
    # Ensure application exists
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    existing = db.query(JobPost).filter(JobPost.application_id == app_id).first()
    if existing:
        existing.raw_text = payload.raw_text
        db.commit()
        db.refresh(existing)
        return existing

    job = JobPost(application_id=app_id, raw_text=payload.raw_text)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/{app_id}/job", response_model=JobPostOut)
def get_job_description(app_id: int, db: Session = Depends(get_db)):
    job = db.query(JobPost).filter(JobPost.application_id == app_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="No job description found for this application")
    return job
