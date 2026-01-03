from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.db.models import Application, ApplicationStatus
from app.schemas.applications import ApplicationCreate, ApplicationOut, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("", response_model=ApplicationOut, status_code=201)
def create_application(payload: ApplicationCreate, db:Session = Depends(get_db)):
    app_obj = Application(
        company = payload.company,
        role_title = payload.role_title,
        job_url = str(payload.job_url) if payload.job_url else None,
        status = ApplicationStatus.APPLIED,
    )
    db.add(app_obj) # stage for insert
    db.commit()     # write to DB
    db.refresh(app_obj) # reoload generated fields(like id)
    return app_obj


@router.get("", response_model=list[ApplicationOut])
def list_applications(db: Session = Depends(get_db)):
    return db.query(Application).order_by(Application.created_at.desc()).all()


@router.get("/{app_id}", response_model=ApplicationOut)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(app_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    app_obj.status = ApplicationStatus(payload.status.value)
    db.commit()
    db.refresh(app_obj)
    return app_obj