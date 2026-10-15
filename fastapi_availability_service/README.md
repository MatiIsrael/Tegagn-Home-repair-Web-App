# Tegagn Service Availability Microservice (FastAPI & Pydantic)

An educational, standalone microservice demonstrating **FastAPI**, **Pydantic v2**, and **SQLAlchemy 2.0** for trade professional scheduling and real-time appointment availability.

---

## 1. FastAPI vs. Django REST Framework: Core Architectural Differences

| Feature / Dimension | Django REST Framework (DRF) | FastAPI |
| :--- | :--- | :--- |
| **Philosophy** | **Batteries-Included Monolith**: ORM, migrations, admin panel, auth, CSRF, and templating built-in. | **Micro-Framework / Toolkit**: Minimal core; you pick your ORM (SQLAlchemy/SQLModel), migrations (Alembic), and auth libraries. |
| **Concurrency & Async** | Historically synchronous WSGI (with evolving ASGI support in Django 4/5/6). | **Native Async (ASGI)**: First-class support for `async def` and concurrent I/O. |
| **Type Hints & Validation** | Uses custom `Serializer` and `Field` classes. Validation is decoupled from Python typing. | Uses standard Python type hints + **Pydantic**. Type hints define validation, serialization, and docs simultaneously. |
| **API Documentation** | Requires third-party tools like `drf-spectacular` or `drf-yasg`. | **Auto-generated Interactive Docs**: Built-in Swagger UI (`/docs`) and ReDoc (`/redoc`) without extra config. |
| **Dependency Injection** | Middleware, custom permission classes, and view inheritance. | **Built-in `Depends()` system**: Composable, testable, hierarchical dependency injection. |
| **Best Used For** | Complex applications requiring unified auth, relational administration panels, and pre-packaged tools. | High-throughput microservices, real-time APIs, machine learning inference endpoints, and async webhooks. |

---

## 2. Project Architecture & Concepts Taught

```
fastapi_availability_service/
├── database.py       # Concept: SQLAlchemy Engine, SessionLocal, and Dependency Injection (get_db)
├── models.py         # Concept: Database Relational Modeling with SQLAlchemy 2.0
├── schemas.py        # Concept: Data Validation, Sanitization, and Serialization with Pydantic v2
├── auth.py           # Concept: Reusable Security Dependencies, Token Extraction, and RBAC
├── routers/
│   └── slots.py      # Concept: Modular Routing, CRUD, Collision Checks, and HTTP Status Codes
├── main.py           # Concept: Application Factory, OpenAPI Metadata, CORS, and Exception Handlers
└── tests/
    └── test_slots.py # Concept: Fast In-Memory Testing using FastAPI's TestClient and Pytest
```

### Concept 1: Data Modeling & Validation with Pydantic v2
Instead of writing separate serializers and documentation definitions, Pydantic uses standard Python type annotations:
```python
class AvailabilitySlotCreate(AvailabilitySlotBase):
    @model_validator(mode='after')
    def validate_time_window(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be strictly earlier than end_time.")
        return self
```
- If a client sends invalid JSON or an impossible time range (e.g. `16:00` to `10:00`), Pydantic rejects it automatically with `422 Unprocessable Content`.

### Concept 2: Dependency Injection with `Depends()`
FastAPI's `Depends()` allows sharing database sessions and authentication guards across route handlers without global state:
```python
@router.post("/")
def create_slot(
    payload: AvailabilitySlotCreate,
    db: Session = Depends(get_db),                       # Database session injected & automatically closed
    current_user: CurrentUser = Depends(require_worker), # Authentication & role checked before code runs
):
    ...
```

### Concept 3: Database Safety (PostgreSQL vs. Dev SQLite)
In [`database.py`](database.py):
- Reads `AVAILABILITY_DATABASE_URL` or `DATABASE_URL` from the environment (e.g. Supabase PostgreSQL `postgresql://user:pass@host:5432/db`).
- Falls back safely to a local `sqlite:///./availability_dev.db` file when no database URL is set, ensuring your production database is never accidentally modified during experimentation.

---

## 3. How to Run the FastAPI Microservice

### Start the Local Development Server:
From the workspace root directory:
```bash
python -m uvicorn fastapi_availability_service.main:app --reload --port 8001
```

Once running:
- **Interactive Swagger UI**: Open [http://localhost:8001/docs](http://localhost:8001/docs) in your browser.
- **Alternative ReDoc UI**: Open [http://localhost:8001/redoc](http://localhost:8001/redoc).
- **Health Check**: Open [http://localhost:8001/health](http://localhost:8001/health).

---

## 4. How to Test Authenticated Endpoints in Swagger UI

Click **Authorize** in Swagger UI or use `curl`:

1. **Trade Professional (Worker)**:
   - Header: `Authorization: Bearer worker-tadesse-key`
   - Allowed: Create slots, update own slots, delete own unbooked slots.
2. **Customer**:
   - Header: `Authorization: Bearer customer-helen-key`
   - Allowed: Read public slots, search by date/worker. Blocked from creating or deleting slots (`403 Forbidden`).
3. **Platform Administrator**:
   - Header: `Authorization: Bearer admin-master-key`
   - Allowed: Full override across all slots.

---

## 5. Running the Automated Pytest Suite

Run all tests in an isolated in-memory test database:
```bash
python -m pytest fastapi_availability_service/tests/test_slots.py -v
```

**Test Coverage Highlights**:
- Health and root endpoint responsiveness.
- Pydantic validation (rejecting inverted time windows).
- Collision detection (rejecting overlapping schedule slots).
- Role-based authorization (blocking customers from worker endpoints).
- Object-level ownership (workers cannot modify other workers' schedules).
- Safety guards (preventing deletion of booked slots).
