import datetime as dt
from typing import Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict

class AvailabilitySlotBase(BaseModel):
    """Base fields shared across request and response schemas."""
    worker_id: str = Field(..., min_length=3, max_length=64, description="Unique identifier of the trade professional")
    date: dt.date = Field(..., description="Calendar date for the availability slot (YYYY-MM-DD)")
    start_time: dt.time = Field(..., description="Starting time of working window (HH:MM:SS)")
    end_time: dt.time = Field(..., description="Ending time of working window (HH:MM:SS)")
    notes: Optional[str] = Field(None, max_length=500, description="Optional worker scheduling notes (e.g. 'Sarbet area only')")


class AvailabilitySlotCreate(AvailabilitySlotBase):
    """
    Schema for creating a new availability slot.
    Enforces time sanity: start_time must strictly precede end_time.
    """
    @model_validator(mode='after')
    def validate_time_window(self):
        if self.start_time >= self.end_time:
            raise ValueError(
                f"start_time ({self.start_time}) must be strictly earlier than end_time ({self.end_time})."
            )
        return self


class AvailabilitySlotUpdate(BaseModel):
    """
    Schema for updating an existing slot.
    Allows toggling reservation state or adjusting start/end times.
    """
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    end_time: Optional[dt.time] = None
    is_booked: Optional[bool] = None
    booking_id: Optional[str] = Field(None, max_length=64)
    notes: Optional[str] = Field(None, max_length=500)

    @model_validator(mode='after')
    def validate_time_window_if_both_provided(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValueError("start_time must be strictly earlier than end_time.")
        return self


class AvailabilitySlotResponse(AvailabilitySlotBase):
    """
    Schema returned to API clients.
    Uses Pydantic v2 from_attributes=True to serialize directly from SQLAlchemy ORM models.
    """
    id: int
    is_booked: bool
    booking_id: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)


class StandardMessageResponse(BaseModel):
    """Standard success message payload."""
    message: str
    detail: Optional[str] = None
