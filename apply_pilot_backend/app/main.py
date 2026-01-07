from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.db.models import Base
from app.api.routes.applications import router as applications_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.documents import application_docs_router, documents_router

app = FastAPI(title="ApplyPilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


# ROUTERS
app.include_router(applications_router)
app.include_router(jobs_router)
app.include_router(application_docs_router)
app.include_router(documents_router)  # include ONLY ONCE


@app.get("/")
def root():
    return {"message": "Applyflow API is running. Go to /docs"}
