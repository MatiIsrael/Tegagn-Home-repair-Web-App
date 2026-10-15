from django.urls import path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    BookingStatusTransitionView,
)

app_name = 'bookings'

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('<uuid:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<uuid:pk>/status/', BookingStatusTransitionView.as_view(), name='booking-status-transition'),
]
