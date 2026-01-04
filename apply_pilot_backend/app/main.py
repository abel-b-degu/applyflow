# from sqlalchemy import create_engine, Column, Integer, String
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker


# from fastapi import FastAPI

# app = FastAPI()

# # define the url for the sqlite database
# DATABASE_URL = "sqlite:///./test.db"

# # this engine connects our fast API application to the databas
# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread: False"})

# # this sessionmaker is what we use to interact with the database
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # this base class is the foundation for all our database models
# # it helps SQLAlchemy manage the models and map them to database tables
# Base = declarative_base()

# # The above is the basic setup connection to our sqlite database

from fastapi import FastAPI
from app.db.session import engine
from app.db.models import Base
from app.api.routes.applications import router as applications_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.documents import router as documents_router




app = FastAPI(title="ApplyPilot")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
 
@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(applications_router)
app.include_router(jobs_router)
app.include_router(documents_router)


@app.get("/")
def root():
    return {"message": "Applyflow API is running. Go to /docs"}
