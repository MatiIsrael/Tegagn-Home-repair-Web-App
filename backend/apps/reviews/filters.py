import django_filters
from .models import Review

class ReviewFilter(django_filters.FilterSet):
    """
    Filter set for reviews:
    - worker_id: Filter reviews for a specific worker
    - customer_id: Filter reviews submitted by a specific customer
    - rating: Exact star rating (e.g., 5)
    - min_rating: Minimum star rating (e.g., >= 4)
    """
    worker_id = django_filters.UUIDFilter(field_name='worker__id')
    customer_id = django_filters.UUIDFilter(field_name='customer__id')
    rating = django_filters.NumberFilter(field_name='rating')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')

    class Meta:
        model = Review
        fields = ['worker_id', 'customer_id', 'rating', 'min_rating']
