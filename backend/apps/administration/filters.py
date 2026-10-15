import django_filters
from django.db.models import Q
from apps.accounts.models import User
from apps.workers.models import WorkerProfile
from apps.bookings.models import Booking
from apps.reviews.models import Review
from .models import AuditLog

class AdminUserFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='Search Users')
    role = django_filters.ChoiceFilter(choices=User.Role.choices)
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = User
        fields = ['role', 'is_active', 'search']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(email__icontains=val) |
            Q(first_name__icontains=val) |
            Q(last_name__icontains=val) |
            Q(phone_number__icontains=val)
        )


class AdminWorkerFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='Search Workers')
    is_verified = django_filters.BooleanFilter()
    is_available = django_filters.BooleanFilter()
    category = django_filters.CharFilter(field_name='primary_category__slug')

    class Meta:
        model = WorkerProfile
        fields = ['is_verified', 'is_available', 'category', 'search']

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(user__first_name__icontains=val) |
            Q(user__last_name__icontains=val) |
            Q(user__email__icontains=val) |
            Q(trade_title__icontains=val)
        )


class AdminBookingFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Booking.Status.choices)
    worker_id = django_filters.UUIDFilter(field_name='worker__id')
    customer_id = django_filters.UUIDFilter(field_name='customer__id')
    start_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='lte')

    class Meta:
        model = Booking
        fields = ['status', 'worker_id', 'customer_id', 'start_date', 'end_date']


class AdminReviewFilter(django_filters.FilterSet):
    is_public = django_filters.BooleanFilter()
    rating = django_filters.NumberFilter()
    worker_id = django_filters.UUIDFilter(field_name='worker__id')

    class Meta:
        model = Review
        fields = ['is_public', 'rating', 'worker_id']


class AuditLogFilter(django_filters.FilterSet):
    action = django_filters.ChoiceFilter(choices=AuditLog.Action.choices)
    resource_type = django_filters.CharFilter(lookup_expr='iexact')
    actor_id = django_filters.UUIDFilter(field_name='actor__id')

    class Meta:
        model = AuditLog
        fields = ['action', 'resource_type', 'actor_id']
