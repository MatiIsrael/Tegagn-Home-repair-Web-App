import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

def generate_booking_reference():
    """Generates a human-friendly unique reference code: e.g. TG-2026-AB12CD"""
    year = timezone.now().year
    random_hex = secrets.token_hex(3).upper()
    return f"TG-{year}-{random_hex}"


class Booking(models.Model):
    """
    Core marketplace booking between a customer and a service professional.
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Confirmation'
        ACCEPTED = 'accepted', 'Accepted & Confirmed'
        DECLINED = 'declined', 'Declined by Worker'
        IN_PROGRESS = 'in_progress', 'Work in Progress'
        COMPLETED = 'completed', 'Completed & Verified'
        CANCELLED = 'cancelled', 'Cancelled'
        DISPUTED = 'disputed', 'In Dispute'

    PERMITTED_TRANSITIONS = {
        Status.PENDING: [Status.ACCEPTED, Status.DECLINED, Status.CANCELLED],
        Status.ACCEPTED: [Status.IN_PROGRESS, Status.COMPLETED, Status.CANCELLED],
        Status.IN_PROGRESS: [Status.COMPLETED, Status.DISPUTED],
        Status.COMPLETED: [Status.DISPUTED],
        Status.DISPUTED: [Status.COMPLETED],
        Status.DECLINED: [],
        Status.CANCELLED: [],
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_number = models.CharField(
        max_length=20,
        unique=True,
        default=generate_booking_reference,
        editable=False,
        db_index=True
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='customer_bookings'
    )
    worker = models.ForeignKey(
        'workers.WorkerProfile',
        on_delete=models.RESTRICT,
        related_name='worker_bookings'
    )
    service = models.ForeignKey(
        'workers.WorkerService',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    service_title = models.CharField(max_length=120)
    service_category = models.ForeignKey(
        'services.ServiceCategory',
        on_delete=models.RESTRICT,
        related_name='category_bookings'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    scheduled_date = models.DateField(db_index=True)
    scheduled_time_slot = models.CharField(max_length=50)
    service_address = models.TextField()
    service_city = models.CharField(max_length=80, default='Addis Ababa')
    customer_notes = models.TextField(blank=True, null=True)
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='ETB')

    # Lifecycle milestones
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancellations_initiated'
    )
    cancellation_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-scheduled_date', '-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['worker', 'scheduled_date']),
        ]

    def __str__(self):
        return f"{self.reference_number}: {self.service_title} ({self.status})"

    def clean(self):
        # Prevent customer from booking their own worker profile
        if hasattr(self.customer, 'worker_profile') and self.customer.worker_profile == self.worker:
            raise ValidationError("You cannot book a service with your own worker profile.")
        super().clean()

    def can_transition_to(self, new_status):
        """Check if transition from current status to new_status is allowed."""
        return new_status in self.PERMITTED_TRANSITIONS.get(self.status, [])

    def transition_to(self, new_status, user, reason=None):
        """Safely transition booking status and record in history."""
        if not self.can_transition_to(new_status) and not user.is_superuser:
            raise ValidationError(f"Invalid transition from '{self.status}' to '{new_status}'.")

        old_status = self.status
        self.status = new_status
        now = timezone.now()

        if new_status == self.Status.ACCEPTED:
            self.accepted_at = now
        elif new_status == self.Status.IN_PROGRESS:
            self.started_at = now
        elif new_status == self.Status.COMPLETED:
            self.completed_at = now
            # Increment worker completed jobs
            self.worker.completed_jobs_count += 1
            self.worker.save(update_fields=['completed_jobs_count'])
        elif new_status == self.Status.CANCELLED:
            self.cancelled_at = now
            self.cancelled_by_user = user
            self.cancellation_reason = reason

        self.save()

        # Record state change in history ledger
        BookingStatusHistory.objects.create(
            booking=self,
            from_status=old_status,
            to_status=new_status,
            changed_by=user,
            reason=reason
        )


class BookingStatusHistory(models.Model):
    """Immutable audit trail for all booking status changes."""
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    from_status = models.CharField(max_length=20, null=True, blank=True)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT
    )
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking_status_history'
        verbose_name = 'Booking Status History'
        verbose_name_plural = 'Booking Status Histories'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.booking.reference_number}: {self.from_status} -> {self.to_status} by {self.changed_by.get_full_name()}"
