from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Time, Boolean, Text, DateTime
from .database import Base

class AvailabilitySlot(Base):
    """
    SQLAlchemy ORM Model representing a service professional's schedule window.
    Inspired by Tegagn's trade scheduling system.
    """
    __tablename__ = "availability_slots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(String(64), index=True, nullable=False, doc="Worker UUID or identifier")
    date = Column(Date, index=True, nullable=False, doc="Calendar date of availability")
    start_time = Column(Time, nullable=False, doc="Slot starting time (e.g. 09:00:00)")
    end_time = Column(Time, nullable=False, doc="Slot ending time (e.g. 12:00:00)")
    is_booked = Column(Boolean, default=False, index=True, doc="True if reserved by a customer")
    booking_id = Column(String(64), nullable=True, doc="Associated booking UUID if booked")
    notes = Column(Text, nullable=True, doc="Optional worker schedule note or location preference")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<AvailabilitySlot id={self.id} worker={self.worker_id} date={self.date} {self.start_time}-{self.end_time} booked={self.is_booked}>"
