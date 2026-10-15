import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# ------------------------------------------------------------------------------
# DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
# In production/staging: supply a PostgreSQL URL e.g. postgresql://user:pass@host:5432/db
# In safe local development: defaults to SQLite file to avoid touching production data.
DATABASE_URL = os.getenv(
    "AVAILABILITY_DATABASE_URL", 
    os.getenv("DATABASE_URL", "sqlite:///./availability_dev.db")
)

# SQLite requires 'check_same_thread: False' because FastAPI handles requests across worker threads
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically tests connection health before executing queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI Dependency that provides an isolated database session per request.
    Automatically closes the session when the request completes (or fails).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
