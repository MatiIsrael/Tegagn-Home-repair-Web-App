import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

class Review(models.Model):
    """
    Verified customer review on a completed booking.
    Strictly 1-to-1 with a Booking to prevent duplicate ratings.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.RESTRICT,
        related_name='review'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='reviews_written'
    )
    worker = models.ForeignKey(
        'workers.WorkerProfile',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Overall rating between 1 and 5 stars"
    )
    comment = models.TextField(help_text="Detailed feedback describing service quality")
    
    # Detailed sub-scores
    punctuality_rating = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    quality_rating = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    cleanliness_rating = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    # Worker response
    worker_reply = models.TextField(null=True, blank=True)
    worker_replied_at = models.DateTimeField(null=True, blank=True)

    is_public = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}★ review for {self.worker.user.get_full_name()} by {self.customer.get_full_name()}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_worker_aggregates()

    def delete(self, *args, **kwargs):
        worker = self.worker
        super().delete(*args, **kwargs)
        # Recalculate after deletion
        aggregates = worker.reviews.filter(is_public=True).aggregate(
            avg_rating=Avg('rating'),
            count=models.Count('id')
        )
        worker.rating_average = round(aggregates['avg_rating'] or 0.00, 2)
        worker.reviews_count = aggregates['count'] or 0
        worker.save(update_fields=['rating_average', 'reviews_count'])

    def update_worker_aggregates(self):
        """Recalculate worker's average rating and total review count."""
        aggregates = self.worker.reviews.filter(is_public=True).aggregate(
            avg_rating=Avg('rating'),
            count=models.Count('id')
        )
        self.worker.rating_average = round(aggregates['avg_rating'] or 0.00, 2)
        self.worker.reviews_count = aggregates['count'] or 0
        self.worker.save(update_fields=['rating_average', 'reviews_count'])
