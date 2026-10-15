import pytest
from datetime import date, time
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from fastapi_availability_service.database import Base, get_db
from fastapi_availability_service.main import app

# ------------------------------------------------------------------------------
# TEST SETUP: In-memory isolated database for lightning-fast, zero-side-effect tests
# ------------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    """Create fresh tables for every test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ------------------------------------------------------------------------------
# 1. Health & Root Tests
# ------------------------------------------------------------------------------
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Tegagn" in data["service"]


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "/docs" in data["documentation"]


# ------------------------------------------------------------------------------
# 2. Authentication & Authorization Tests
# ------------------------------------------------------------------------------
def test_create_slot_requires_authentication():
    """Unauthenticated POST request returns 401 Unauthorized."""
    payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }
    response = client.post("/slots/", json=payload)
    assert response.status_code == 401


def test_customer_cannot_create_slot():
    """Customers receive 403 Forbidden when attempting to schedule availability."""
    payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }
    headers = {"Authorization": "Bearer customer-helen-key"}
    response = client.post("/slots/", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Only registered trade service professionals" in response.json()["detail"]


def test_worker_cannot_create_slot_for_another_worker():
    """Worker Tadesse cannot schedule a slot under Worker Sara's ID."""
    payload = {
        "worker_id": "worker-sara",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }
    headers = {"Authorization": "Bearer worker-tadesse-key"}
    response = client.post("/slots/", json=payload, headers=headers)
    assert response.status_code == 403
    assert "You can only manage your own slots" in response.json()["detail"]


# ------------------------------------------------------------------------------
# 3. Validation & Conflict Tests
# ------------------------------------------------------------------------------
def test_create_slot_invalid_time_window_rejected():
    """Pydantic model validator rejects end_time earlier than start_time."""
    payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "16:00:00",
        "end_time": "10:00:00"  # Invalid: end is before start!
    }
    headers = {"Authorization": "Bearer worker-tadesse-key"}
    response = client.post("/slots/", json=payload, headers=headers)
    assert response.status_code == 422
    data = response.json()
    assert data["status"] == "error"
    assert any("earlier than end_time" in err["message"] for err in data["errors"])


def test_create_slot_success():
    """Worker successfully creates an availability slot."""
    payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "notes": "Available for plumbing inspections in Sarbet"
    }
    headers = {"Authorization": "Bearer worker-tadesse-key"}
    response = client.post("/slots/", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["worker_id"] == "worker-tadesse"
    assert data["is_booked"] is False
    assert data["notes"] == "Available for plumbing inspections in Sarbet"


def test_overlapping_slot_conflict_rejected():
    """Collision detection returns 409 Conflict when a new slot overlaps an existing one."""
    headers = {"Authorization": "Bearer worker-tadesse-key"}
    initial_payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }
    res1 = client.post("/slots/", json=initial_payload, headers=headers)
    assert res1.status_code == 201

    # Overlapping slot: 10:00:00 to 13:00:00 (overlaps with 09:00 - 12:00)
    overlapping_payload = {
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "10:00:00",
        "end_time": "13:00:00"
    }
    res2 = client.post("/slots/", json=overlapping_payload, headers=headers)
    assert res2.status_code == 409
    assert "overlaps with existing slot" in res2.json()["detail"]


# ------------------------------------------------------------------------------
# 4. Listing & Filtering Tests
# ------------------------------------------------------------------------------
def test_list_and_filter_slots():
    """Public can list slots and filter by worker_id and date."""
    headers_tadesse = {"Authorization": "Bearer worker-tadesse-key"}
    headers_sara = {"Authorization": "Bearer worker-sara-key"}

    # Tadesse slot
    client.post("/slots/", json={
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }, headers=headers_tadesse)

    # Sara slot
    client.post("/slots/", json={
        "worker_id": "worker-sara",
        "date": "2026-11-02",
        "start_time": "14:00:00",
        "end_time": "17:00:00"
    }, headers=headers_sara)

    # Unfiltered list
    res_all = client.get("/slots/")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 2

    # Filter by worker
    res_tadesse = client.get("/slots/?worker_id=worker-tadesse")
    assert res_tadesse.status_code == 200
    assert len(res_tadesse.json()) == 1
    assert res_tadesse.json()[0]["worker_id"] == "worker-tadesse"


# ------------------------------------------------------------------------------
# 5. Update & Delete Tests
# ------------------------------------------------------------------------------
def test_update_slot_permissions():
    """Worker can update their own slot; other workers cannot."""
    headers_tadesse = {"Authorization": "Bearer worker-tadesse-key"}
    headers_sara = {"Authorization": "Bearer worker-sara-key"}

    res = client.post("/slots/", json={
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }, headers=headers_tadesse)
    slot_id = res.json()["id"]

    # Sara tries to update Tadesse's slot
    res_unauth = client.patch(f"/slots/{slot_id}", json={"notes": "Hacked"}, headers=headers_sara)
    assert res_unauth.status_code == 403

    # Tadesse updates their own slot
    res_auth = client.patch(f"/slots/{slot_id}", json={"notes": "Updated valid note"}, headers=headers_tadesse)
    assert res_auth.status_code == 200
    assert res_auth.json()["notes"] == "Updated valid note"


def test_delete_slot_and_booked_protection():
    """Cannot delete a booked slot; unbooked slot deletes with 204."""
    headers_tadesse = {"Authorization": "Bearer worker-tadesse-key"}

    res = client.post("/slots/", json={
        "worker_id": "worker-tadesse",
        "date": "2026-11-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00"
    }, headers=headers_tadesse)
    slot_id = res.json()["id"]

    # Mark slot as booked
    client.patch(f"/slots/{slot_id}", json={"is_booked": True, "booking_id": "tg-book-100"}, headers=headers_tadesse)

    # Attempt to delete booked slot
    res_del_booked = client.delete(f"/slots/{slot_id}", headers=headers_tadesse)
    assert res_del_booked.status_code == 400
    assert "Cannot delete a slot that has already been booked" in res_del_booked.json()["detail"]

    # Unmark booked and delete
    client.patch(f"/slots/{slot_id}", json={"is_booked": False}, headers=headers_tadesse)
    res_del_ok = client.delete(f"/slots/{slot_id}", headers=headers_tadesse)
    assert res_del_ok.status_code == 204

    # Confirm it's gone
    res_check = client.get(f"/slots/{slot_id}")
    assert res_check.status_code == 404
