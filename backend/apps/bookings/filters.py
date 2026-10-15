import django_filters
from django.db.models import Q
from .models import Booking

class BookingFilter(django_filters.FilterSet):
    """
    Filtering for user and worker bookings.
    Supports filtering by status, role perspective, category, and date range.
    """
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    category = django_filters.CharFilter(field_name='service_category__slug', lookup_expr='iexact')
    from_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='gte')
    to_date = django_filters.DateFilter(field_name='scheduled_date', lookup_expr='lte')
    role_view = django_filters.CharFilter(method='filter_role_view')
    ordering = django_filters.OrderingFilter(
        fields=(
            ('scheduled_date', 'scheduled_date'),
            ('created_at', 'created_at'),
            ('agreed_price', 'price'),
        )
    )

    class Meta:
        model = Booking
        fields = ['status', 'category', 'from_date', 'to_date', 'role_view', 'ordering']

    def filter_role_view(self, queryset, name, value):
        user = self.request.user
        val = value.lower()
        if val == 'customer':
            return queryset.filter(customer=user)
        elif val == 'worker' and hasattr(user, 'worker_profile'):
            return queryset.filter(worker=user.worker_profile)
        return queryset
