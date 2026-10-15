from django.contrib import admin
from .models import WorkerProfile, WorkerService

class WorkerServiceInline(admin.TabularInline):
    model = WorkerService
    extra = 1

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'trade_title',
        'primary_category',
        'hourly_rate',
        'currency',
        'rating_average',
        'reviews_count',
        'is_available',
        'is_verified',
    )
    list_filter = ('primary_category', 'is_available', 'is_verified', 'is_emergency_ready')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'trade_title', 'bio')
    inlines = [WorkerServiceInline]

@admin.register(WorkerService)
class WorkerServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'worker', 'category', 'price', 'currency', 'price_type', 'is_active')
    list_filter = ('price_type', 'is_active', 'category')
    search_fields = ('title', 'description', 'worker__user__first_name', 'worker__user__last_name')
