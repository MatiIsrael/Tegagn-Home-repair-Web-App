from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ..database import get_db
from ..models import AvailabilitySlot
from ..schemas import (
    AvailabilitySlotCreate,
    AvailabilitySlotUpdate,
    AvailabilitySlotResponse,
)
from ..auth import CurrentUser, require_worker, get_current_user

router = APIRouter(
    prefix="/slots",
    tags=["Availability Slots"],
    responses={
        404: {"description": "Availability slot not found"},
        401: {"description": "Authentication credentials missing or invalid"},
        403: {"description": "Forbidden - Insufficient role permissions"},
    }
)

# ------------------------------------------------------------------------------
# 1. CREATE Availability Slot (Worker Only)
# ------------------------------------------------------------------------------
@router.post(
    "/",
    response_model=AvailabilitySlotResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an availability slot",
    description="Allows a trade professional to schedule a working time window."
)
def create_slot(
    payload: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_worker),
):
    # Enforce worker ownership: worker can only create slots for their own account
    if current_user.role != "admin" and payload.worker_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You cannot create an availability slot for worker '{payload.worker_id}'. You can only manage your own slots."
        )

    # Collision detection: prevent overlapping availability slots for the same worker on the same day
    overlapping = db.query(AvailabilitySlot).filter(
        and_(
            AvailabilitySlot.worker_id == payload.worker_id,
            AvailabilitySlot.date == payload.date,
            or_(
                # New slot starts inside existing slot
                and_(AvailabilitySlot.start_time <= payload.start_time, AvailabilitySlot.end_time > payload.start_time),
                # New slot ends inside existing slot
                and_(AvailabilitySlot.start_time < payload.end_time, AvailabilitySlot.end_time >= payload.end_time),
                # New slot encloses existing slot
                and_(AvailabilitySlot.start_time >= payload.start_time, AvailabilitySlot.end_time <= payload.end_time),
            )
        )
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Time window overlaps with existing slot #{overlapping.id} ({overlapping.start_time} - {overlapping.end_time})."
        )

    new_slot = AvailabilitySlot(
        worker_id=payload.worker_id,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        notes=payload.notes,
        is_booked=False,
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot


# ------------------------------------------------------------------------------
# 2. LIST Availability Slots (Public with Filters)
# ------------------------------------------------------------------------------
@router.get(
    "/",
    response_model=List[AvailabilitySlotResponse],
    summary="List availability slots",
    description="Public directory of available booking slots with worker, date, and reservation filters."
)
def list_slots(
    worker_id: Optional[str] = Query(None, description="Filter by specific worker ID"),
    slot_date: Optional[date] = Query(None, alias="date", description="Filter by calendar date (YYYY-MM-DD)"),
    is_booked: Optional[bool] = Query(None, description="Filter by booking status (e.g. false for unbooked slots)"),
    limit: int = Query(50, ge=1, le=100, description="Pagination limit"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
):
    query = db.query(AvailabilitySlot)

    if worker_id:
        query = query.filter(AvailabilitySlot.worker_id == worker_id)
    if slot_date:
        query = query.filter(AvailabilitySlot.date == slot_date)
    if is_booked is not None:
        query = query.filter(AvailabilitySlot.is_booked == is_booked)

    # Order chronologically: by date ascending, then start time ascending
    slots = query.order_by(AvailabilitySlot.date.asc(), AvailabilitySlot.start_time.asc()).offset(offset).limit(limit).all()
    return slots


# ------------------------------------------------------------------------------
# 3. GET Single Availability Slot
# ------------------------------------------------------------------------------
@router.get(
    "/{slot_id}",
    response_model=AvailabilitySlotResponse,
    summary="Retrieve single slot details"
)
def get_slot(
    slot_id: int,
    db: Session = Depends(get_db),
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability slot #{slot_id} not found."
        )
    return slot


# ------------------------------------------------------------------------------
# 4. UPDATE Availability Slot (Owner Worker or Admin Only)
# ------------------------------------------------------------------------------
@router.patch(
    "/{slot_id}",
    response_model=AvailabilitySlotResponse,
    summary="Update availability slot",
    description="Allows the owning worker (or admin) to modify slot details or mark it reserved."
)
def update_slot(
    slot_id: int,
    payload: AvailabilitySlotUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_worker),
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability slot #{slot_id} not found."
        )

    # Object-level permission check: only owning worker or admin can modify
    if current_user.role != "admin" and slot.worker_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another tradesperson's schedule."
        )

    # Apply updates from payload
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(slot, field, value)

    db.commit()
    db.refresh(slot)
    return slot


# ------------------------------------------------------------------------------
# 5. DELETE Availability Slot (Owner Worker or Admin Only)
# ------------------------------------------------------------------------------
@router.delete(
    "/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete availability slot",
    description="Deletes an availability slot. Reserved slots cannot be deleted without cancellation."
)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_worker),
):
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Availability slot #{slot_id} not found."
        )

    # Object-level permission check
    if current_user.role != "admin" and slot.worker_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete another tradesperson's schedule."
        )

    # Cannot delete a slot that already has a customer booking
    if slot.is_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a slot that has already been booked by a customer. Cancel the associated booking first."
        )

    db.delete(slot)
    db.commit()
    return None
