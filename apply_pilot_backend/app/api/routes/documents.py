from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.db.models import Application, JobPost, Document
from app.schemas.documents import DocumentOut
from app.services.llm import generate_cover_letter

# Router for AI-generated documents tied to applications
application_docs_router = APIRouter(
    prefix="/applications", tags=["ai_documents"])


@application_docs_router.post("/{app_id}/cover-letter", response_model=DocumentOut, status_code=201)
def create_cover_letter(app_id: int, db: Session = Depends(get_db)):
    # Verify application exists
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify job description exists
    job = db.query(JobPost).filter(JobPost.application_id == app_id).first()
    if not job:
        raise HTTPException(
            status_code=400, detail="Add a job description first")

    # Generate cover letter using LLaMA
    content = generate_cover_letter(
        company=app_obj.company,
        role=app_obj.role_title,
        job_description=job.raw_text
    )

    # Save generated document
    doc = Document(
        application_id=app_id,
        doc_type="COVER_LETTER",
        content=content
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


# Router for listing all documents
documents_router = APIRouter(prefix="/documents", tags=["documents"])


@documents_router.get("/", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    """
    Returns all generated documents (cover letters, resumes, summaries, etc).
    """
    return db.query(Document).order_by(Document.id.desc()).all()
