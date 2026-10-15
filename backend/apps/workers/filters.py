import django_filters
from django.db.models import Q
from .models import WorkerProfile

class WorkerProfileFilter(django_filters.FilterSet):
    """
    Rich filtering for the public worker directory.
    Supports search by keyword/skill/location, category slug/key,
    price bounds, ratings, verification badges, and frontend parameter naming.
    """
    search = django_filters.CharFilter(method='filter_search', label='Keyword Search')
    skill = django_filters.CharFilter(method='filter_skill', label='Skill Filter')
    category = django_filters.CharFilter(method='filter_category', label='Category Slug or Key')
    city = django_filters.CharFilter(method='filter_location', label='City or Neighborhood')
    location = django_filters.CharFilter(method='filter_location', label='City or Neighborhood (alias)')
    
    # Price bounds (supports both min_price and min_hourly_rate)
    min_price = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte')
    min_hourly_rate = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte')
    max_hourly_rate = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte')

    # Rating threshold
    min_rating = django_filters.NumberFilter(field_name='rating_average', lookup_expr='gte')

    # Status toggles
    is_available = django_filters.BooleanFilter(field_name='is_available')
    is_verified = django_filters.BooleanFilter(field_name='is_verified')
    is_emergency = django_filters.BooleanFilter(field_name='is_emergency_ready')
    is_emergency_ready = django_filters.BooleanFilter(field_name='is_emergency_ready')

    # Sorting
    sortBy = django_filters.CharFilter(method='filter_sort_by', label='Sorting criteria')

    class Meta:
        model = WorkerProfile
        fields = [
            'search',
            'skill',
            'category',
            'city',
            'location',
            'min_price',
            'max_price',
            'min_hourly_rate',
            'max_hourly_rate',
            'min_rating',
            'is_available',
            'is_verified',
            'is_emergency',
            'is_emergency_ready',
            'sortBy',
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(user__first_name__icontains=val) |
            Q(user__last_name__icontains=val) |
            Q(trade_title__icontains=val) |
            Q(bio__icontains=val) |
            Q(skills__icontains=val) |
            Q(service_areas__icontains=val) |
            Q(user__city__icontains=val) |
            Q(primary_category__name__icontains=val)
        )

    def filter_skill(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip().lower()
        return queryset.filter(skills__icontains=val)

    def filter_category(self, queryset, name, value):
        if not value or value.lower() == 'all':
            return queryset
        val = value.strip().lower()
        return queryset.filter(
            Q(primary_category__slug__iexact=val) |
            Q(primary_category__trade_key__iexact=val)
        )

    def filter_location(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        return queryset.filter(
            Q(user__city__icontains=val) |
            Q(service_areas__icontains=val)
        )

    def filter_sort_by(self, queryset, name, value):
        # Safe sorting map preventing arbitrary SQL injection or unsafe field access
        SORT_MAPPING = {
            'rating_desc': '-rating_average',
            'price_asc': 'hourly_rate',
            'price_desc': '-hourly_rate',
            'experience_desc': '-experience_years',
            'newest': '-created_at',
            'jobs_desc': '-completed_jobs_count',
        }
        order_field = SORT_MAPPING.get(value)
        if order_field:
            return queryset.order_by(order_field)
        return queryset
