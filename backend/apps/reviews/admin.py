from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('worker', 'customer', 'rating', 'punctuality_rating', 'quality_rating', 'is_public', 'created_at')
    list_filter = ('rating', 'is_public', 'created_at')
    search_fields = (
        'worker__user__first_name',
        'worker__user__last_name',
        'customer__first_name',
        'customer__last_name',
        'comment'
    )
    readonly_fields = ('created_at', 'updated_at')
