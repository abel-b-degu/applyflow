from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.db.models import Application, JobPost, Document
from app.schemas.documents import DocumentOut
from app.services.llm import generate_cover_letter

router = APIRouter(prefix="/applications", tags=["ai_documents"])

@router.post("/{app_id}/cover-letter", response_model=DocumentOut, status_code=201)
def create_cover_letter(app_id: int, db:Session = Depends(get_db)):
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    
    job = db.query(JobPost).filter(JobPost.application_id == app_id).first()
    if not job:
        raise HTTPException(status_code=400, detail = "Add a job description first")
    
    content = generate_cover_letter(
    company=app_obj.company,
    role=app_obj.role_title,
    job_description=job.raw_text
    )
        
    doc = Document(
    application_id=app_id,
    doc_type="COVER_LETTER",
    content=content
    )
        
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

