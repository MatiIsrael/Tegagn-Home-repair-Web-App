from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer, ReviewReplySerializer
from .permissions import CanReplyToReview
from .filters import ReviewFilter
from apps.accounts.permissions import IsCustomer
from tegagn_api.pagination import StandardResultsPagination

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    List verified reviews or submit a new review on a completed booking.
    Supports filtering by worker_id, customer_id, rating, min_rating, and ordering.
    """
    queryset = Review.objects.filter(is_public=True).select_related('customer', 'worker__user', 'booking')
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ReviewFilter
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.AllowAny()]


class ReviewDetailView(generics.RetrieveAPIView):
    """Retrieve details of a single verified review."""
    queryset = Review.objects.filter(is_public=True).select_related('customer', 'worker__user', 'booking')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]


class ReviewReplyView(generics.UpdateAPIView):
    """Allows the reviewed trade professional to post an official reply."""
    queryset = Review.objects.all()
    serializer_class = ReviewReplySerializer
    permission_classes = [permissions.IsAuthenticated, CanReplyToReview]
    http_method_names = ['patch', 'put']
