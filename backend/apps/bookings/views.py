from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingStatusTransitionSerializer,
)
from .filters import BookingFilter
from .permissions import IsBookingParticipant

class BookingListCreateView(generics.ListCreateAPIView):
    """
    List bookings relevant to the current user (as customer or worker)
    or create a new booking request (customers).
    Supports filtering by status, role perspective, category, and date range.
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookingFilter

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            'customer',
            'worker__user',
            'service_category'
        ).prefetch_related('status_history')

        # Limit strictly to records the user is authorized to view
        if hasattr(user, 'worker_profile'):
            return qs.filter(Q(customer=user) | Q(worker=user.worker_profile))
        return qs.filter(customer=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Booking request created successfully. Awaiting worker confirmation.",
                "data": BookingDetailSerializer(booking).data
            },
            status=status.HTTP_201_CREATED
        )


class BookingDetailView(generics.RetrieveAPIView):
    """
    Retrieve detailed view of an individual booking with status timeline.
    Only authorized participants (customer or assigned worker) can view.
    """
    queryset = Booking.objects.select_related(
        'customer',
        'worker__user',
        'service_category'
    ).prefetch_related('status_history')
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingParticipant]


class BookingStatusTransitionView(generics.GenericAPIView):
    """
    Transition a booking status:
    - Worker accepts: 'accepted'
    - Worker declines: 'declined'
    - Worker starts: 'in_progress'
    - Worker finishes / marks done: 'completed'
    - Customer or worker cancels: 'cancelled'
    """
    queryset = Booking.objects.all()
    serializer_class = BookingStatusTransitionSerializer
    permission_classes = [permissions.IsAuthenticated, IsBookingParticipant]

    def post(self, request, pk, *args, **kwargs):
        booking = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'booking': booking, 'request': request})
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['new_status']
        reason = serializer.validated_data.get('reason', '')

        booking.transition_to(new_status, user=request.user, reason=reason)

        return Response(
            {
                "status": "success",
                "message": f"Booking transitioned to '{new_status}'.",
                "data": BookingDetailSerializer(booking).data
            },
            status=status.HTTP_200_OK
        )
