from django.contrib import admin
from .models import Booking, BookingStatusHistory

class BookingStatusHistoryInline(admin.TabularInline):
    model = BookingStatusHistory
    extra = 0
    readonly_fields = ('from_status', 'to_status', 'changed_by', 'reason', 'created_at')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'reference_number',
        'customer',
        'worker',
        'service_title',
        'status',
        'scheduled_date',
        'agreed_price',
        'currency',
        'created_at',
    )
    list_filter = ('status', 'service_category', 'scheduled_date')
    search_fields = (
        'reference_number',
        'customer__first_name',
        'customer__last_name',
        'worker__user__first_name',
        'worker__user__last_name',
        'service_title'
    )
    inlines = [BookingStatusHistoryInline]
    readonly_fields = ('reference_number', 'created_at', 'updated_at')
