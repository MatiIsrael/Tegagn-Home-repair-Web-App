import uuid
from django.db import models

class ServiceCategory(models.Model):
    """
    Standard trade service categories on Tegagn (Plumbing, Electrical, Carpentry, etc.)
    """
    class TradeKey(models.TextChoices):
        PLUMBER = 'plumber', 'Plumbing'
        ELECTRICIAN = 'electrician', 'Electrical'
        CARPENTER = 'carpenter', 'Carpentry & Woodwork'
        PAINTER = 'painter', 'Painting & Finishing'
        BUILDER = 'builder', 'Masonry & Construction'
        CLEANER = 'cleaner', 'Cleaning & Sanitization'
        HVAC = 'hvac', 'HVAC & Climate Control'
        LOCKSMITH = 'locksmith', 'Locksmith'
        ROOFER = 'roofer', 'Roofing'
        GENERAL = 'general', 'General Handyman'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=80, unique=True)
    trade_key = models.CharField(max_length=30, choices=TradeKey.choices, unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='Wrench')
    is_active = models.BooleanField(default=True, db_index=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Service Category'
        verbose_name_plural = 'Service Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.trade_key})"
