import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class WorkerProfile(models.Model):
    """
    Detailed trade profile representing a tradesperson on Tegagn.
    Has a 1-to-1 relationship with the custom User model.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_profile'
    )
    primary_category = models.ForeignKey(
        'services.ServiceCategory',
        on_delete=models.RESTRICT,
        related_name='workers'
    )
    trade_title = models.CharField(max_length=120)
    bio = models.TextField()
    experience_years = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(0), MaxValueValidator(60)]
    )
    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.00)]
    )
    currency = models.CharField(max_length=3, default='ETB')
    is_available = models.BooleanField(default=True, db_index=True)
    is_emergency_ready = models.BooleanField(default=False, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    # Stored as JSON arrays for cross-database compatibility (Postgres JSONB & SQLite)
    service_areas = models.JSONField(default=list, blank=True)
    skills = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)

    # Denormalized aggregate metrics for high-performance directory querying
    rating_average = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        db_index=True,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    reviews_count = models.PositiveIntegerField(default=0)
    completed_jobs_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'worker_profiles'
        verbose_name = 'Worker Profile'
        verbose_name_plural = 'Worker Profiles'
        ordering = ['-rating_average', '-reviews_count']
        indexes = [
            models.Index(fields=['primary_category', 'is_available', 'hourly_rate']),
            models.Index(fields=['rating_average']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.trade_title}"


class WorkerService(models.Model):
    """
    Specific discrete service offered by a worker with defined pricing.
    """
    class PriceType(models.TextChoices):
        FIXED = 'fixed', 'Fixed Price'
        HOURLY = 'hourly', 'Per Hour'
        STARTING_AT = 'starting_at', 'Starting At'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name='services'
    )
    category = models.ForeignKey(
        'services.ServiceCategory',
        on_delete=models.RESTRICT,
        related_name='worker_services'
    )
    title = models.CharField(max_length=120)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.00)]
    )
    currency = models.CharField(max_length=3, default='ETB')
    price_type = models.CharField(max_length=20, choices=PriceType.choices, default=PriceType.FIXED)
    estimated_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'worker_services'
        verbose_name = 'Worker Service'
        verbose_name_plural = 'Worker Services'
        constraints = [
            models.UniqueConstraint(fields=['worker', 'title'], name='unique_worker_service_title')
        ]
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.worker.user.get_full_name()}) - {self.price} {self.currency}"
