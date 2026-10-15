from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .database import engine, Base
from .routers import slots

# Initialize database tables on startup (creates tables if they don't already exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tegagn Service Availability API",
    description="""
### Real-Time Service Window & Availability Management Microservice

Inspired by the **Tegagn Home-Repair Marketplace** architecture, this FastAPI microservice demonstrates:
- **FastAPI & Pydantic v2**: Type-safe validation and response filtering.
- **SQLAlchemy ORM**: Connection pooling and session lifecycle management.
- **Collision Detection**: Enforcing non-overlapping tradesperson time windows.
- **Role-Based Access Control**: Strict worker ownership and administrative overrides.
- **Interactive OpenAPI**: Auto-generated Swagger UI and ReDoc interfaces.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ------------------------------------------------------------------------------
# CORS Configuration
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Exception Handlers
# ------------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic validation errors into clean, consistent JSON."""
    formatted_errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err["loc"])
        formatted_errors.append({
            "field": field,
            "message": err["msg"],
            "type": err["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Request validation failed. Please check input types and constraints.",
            "errors": formatted_errors
        }
    )

# ------------------------------------------------------------------------------
# Routers & Root Endpoints
# ------------------------------------------------------------------------------
app.include_router(slots.router)

@app.get(
    "/health",
    tags=["System Health"],
    summary="Health check",
    description="Verifies that the FastAPI microservice is live and responsive."
)
def health_check():
    return {
        "status": "healthy",
        "service": "Tegagn Availability Microservice",
        "version": "1.0.0"
    }

@app.get(
    "/",
    tags=["Root"],
    summary="Root welcome endpoint"
)
def root():
    return {
        "message": "Welcome to the Tegagn Availability API.",
        "documentation": "/docs",
        "redoc": "/redoc"
    }
