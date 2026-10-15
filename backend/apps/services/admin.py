from django.contrib import admin
from .models import ServiceCategory

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'trade_key', 'slug', 'is_active', 'display_order', 'created_at')
    list_editable = ('is_active', 'display_order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'trade_key', 'description')
    ordering = ('display_order', 'name')
