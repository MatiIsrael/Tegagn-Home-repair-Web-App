from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserStatusView,
    AdminWorkerListView,
    AdminWorkerVerificationView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminBookingListView,
    AdminBookingDetailView,
    AdminReviewListView,
    AdminReviewModerateView,
    AdminPlatformStatsView,
    AdminAuditLogListView,
)

app_name = 'administration'

urlpatterns = [
    # User Management
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('users/<uuid:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<uuid:pk>/status/', AdminUserStatusView.as_view(), name='admin-user-status'),

    # Worker Management & Verification
    path('workers/', AdminWorkerListView.as_view(), name='admin-worker-list'),
    path('workers/<uuid:pk>/verify/', AdminWorkerVerificationView.as_view(), name='admin-worker-verify'),

    # Service Category Governance
    path('categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list-create'),
    path('categories/<slug:slug>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),

    # Booking Overview
    path('bookings/', AdminBookingListView.as_view(), name='admin-booking-list'),
    path('bookings/<uuid:pk>/', AdminBookingDetailView.as_view(), name='admin-booking-detail'),

    # Review Moderation
    path('reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
    path('reviews/<uuid:pk>/moderate/', AdminReviewModerateView.as_view(), name='admin-review-moderate'),

    # Statistics & KPIs
    path('stats/', AdminPlatformStatsView.as_view(), name='admin-stats'),

    # Audit Trail
    path('audit-logs/', AdminAuditLogListView.as_view(), name='admin-audit-logs'),
]
