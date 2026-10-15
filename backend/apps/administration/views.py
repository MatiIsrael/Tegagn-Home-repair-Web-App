from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from apps.accounts.models import User
from apps.workers.models import WorkerProfile
from apps.services.models import ServiceCategory
from apps.bookings.models import Booking
from apps.reviews.models import Review
from .models import AuditLog, log_admin_event
from .permissions import IsPlatformAdministrator
from .serializers import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserStatusUpdateSerializer,
    AdminWorkerListSerializer,
    AdminWorkerVerificationSerializer,
    AdminServiceCategorySerializer,
    AdminBookingListSerializer,
    AdminBookingDetailSerializer,
    AdminReviewListSerializer,
    AdminReviewModerationSerializer,
    AuditLogSerializer,
    AdminPlatformStatsSerializer,
)
from .filters import (
    AdminUserFilter,
    AdminWorkerFilter,
    AdminBookingFilter,
    AdminReviewFilter,
    AuditLogFilter,
)
from tegagn_api.pagination import StandardResultsPagination


# -------------------------------------------------------------
# 1. User Management Views
# -------------------------------------------------------------

class AdminUserListView(generics.ListAPIView):
    """List all registered users with role & status filters and pagination."""
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserListSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AdminUserFilter
    ordering_fields = ['created_at', 'email', 'first_name', 'last_name']


class AdminUserDetailView(generics.RetrieveAPIView):
    """Retrieve complete profile of a user for administrative audit."""
    queryset = User.objects.all()
    serializer_class = AdminUserDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]


class AdminUserStatusView(APIView):
    """
    Suspends or reactivates a user account.
    Records an immutable administrative audit log with caller IP and reason.
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]

    def post(self, request, pk):
        target_user = get_object_or_404(User, pk=pk)
        serializer = AdminUserStatusUpdateSerializer(
            data=request.data,
            context={'request': request, 'target_user': target_user}
        )
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['is_active']
        reason = serializer.validated_data.get('reason', '')

        old_status = target_user.is_active
        target_user.is_active = new_status
        target_user.save(update_fields=['is_active'])

        action = (
            AuditLog.Action.USER_REACTIVATED if new_status
            else AuditLog.Action.USER_SUSPENDED
        )
        description = (
            f"User account {'reactivated' if new_status else 'suspended'}. Reason: {reason or 'Not specified'}"
        )
        log_admin_event(
            actor=request.user,
            action=action,
            resource_type='user',
            resource_id=target_user.id,
            description=description,
            payload={'previous_is_active': old_status, 'new_is_active': new_status, 'reason': reason},
            request=request
        )

        return Response({
            'id': str(target_user.id),
            'email': target_user.email,
            'is_active': target_user.is_active,
            'message': f"Account successfully {'reactivated' if new_status else 'suspended'}."
        }, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 2. Worker Management & Verification Views
# -------------------------------------------------------------

class AdminWorkerListView(generics.ListAPIView):
    """List workers, their trade info, and verification badge status."""
    queryset = WorkerProfile.objects.select_related('user', 'primary_category').all().order_by('-created_at')
    serializer_class = AdminWorkerListSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AdminWorkerFilter
    ordering_fields = ['created_at', 'rating_average', 'reviews_count', 'hourly_rate']


class AdminWorkerVerificationView(APIView):
    """
    Approves or revokes a trade professional's verification badge.
    Records audit entry upon status toggle.
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]

    def post(self, request, pk):
        worker = get_object_or_404(WorkerProfile.objects.select_related('user'), pk=pk)
        serializer = AdminWorkerVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_verified = serializer.validated_data['is_verified']
        notes = serializer.validated_data.get('notes', '')

        previous_state = worker.is_verified
        worker.is_verified = is_verified
        worker.verified_at = timezone.now() if is_verified else None
        worker.save(update_fields=['is_verified', 'verified_at'])

        action = (
            AuditLog.Action.WORKER_VERIFIED if is_verified
            else AuditLog.Action.WORKER_UNVERIFIED
        )
        description = (
            f"Worker verification {'approved' if is_verified else 'revoked'} for {worker.user.get_full_name()}. "
            f"Notes: {notes or 'None'}"
        )
        log_admin_event(
            actor=request.user,
            action=action,
            resource_type='worker',
            resource_id=worker.id,
            description=description,
            payload={'previous_is_verified': previous_state, 'new_is_verified': is_verified, 'notes': notes},
            request=request
        )

        return Response({
            'id': str(worker.id),
            'is_verified': worker.is_verified,
            'verified_at': worker.verified_at,
            'message': f"Worker verification {'granted' if is_verified else 'revoked'}."
        }, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 3. Service Category Governance Views
# -------------------------------------------------------------

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """Allows administrators to view all categories (including inactive) and create new trade categories."""
    queryset = ServiceCategory.objects.all().order_by('display_order', 'name')
    serializer_class = AdminServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = None

    def perform_create(self, serializer):
        category = serializer.save()
        log_admin_event(
            actor=self.request.user,
            action=AuditLog.Action.CATEGORY_CREATED,
            resource_type='service_category',
            resource_id=category.id,
            description=f"Created service category '{category.name}' ({category.slug})",
            payload={'name': category.name, 'trade_key': category.trade_key, 'slug': category.slug},
            request=self.request
        )


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Allows administrators to retrieve, update, or remove a service category."""
    queryset = ServiceCategory.objects.all()
    serializer_class = AdminServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    lookup_field = 'slug'

    def perform_update(self, serializer):
        category = serializer.save()
        log_admin_event(
            actor=self.request.user,
            action=AuditLog.Action.CATEGORY_UPDATED,
            resource_type='service_category',
            resource_id=category.id,
            description=f"Updated service category '{category.name}' ({category.slug})",
            payload=serializer.validated_data,
            request=self.request
        )

    def perform_destroy(self, instance):
        cat_id = instance.id
        cat_name = instance.name
        cat_slug = instance.slug
        instance.delete()
        log_admin_event(
            actor=self.request.user,
            action=AuditLog.Action.CATEGORY_DELETED,
            resource_type='service_category',
            resource_id=cat_id,
            description=f"Deleted service category '{cat_name}' ({cat_slug})",
            request=self.request
        )


# -------------------------------------------------------------
# 4. Booking Overview Views
# -------------------------------------------------------------

class AdminBookingListView(generics.ListAPIView):
    """Overview of platform-wide bookings with status filtering and pagination."""
    queryset = Booking.objects.select_related('customer', 'worker__user').all().order_by('-created_at')
    serializer_class = AdminBookingListSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AdminBookingFilter
    ordering_fields = ['created_at', 'scheduled_date', 'agreed_price', 'status']


class AdminBookingDetailView(generics.RetrieveAPIView):
    """Detailed booking inspection including historical status transitions for dispute resolution."""
    queryset = Booking.objects.select_related('customer', 'worker__user').prefetch_related('status_history__changed_by').all()
    serializer_class = AdminBookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]


# -------------------------------------------------------------
# 5. Review Moderation Views
# -------------------------------------------------------------

class AdminReviewListView(generics.ListAPIView):
    """List all reviews across the marketplace including hidden reviews for moderation."""
    queryset = Review.objects.select_related('customer', 'worker__user', 'booking').all().order_by('-created_at')
    serializer_class = AdminReviewListSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AdminReviewFilter
    ordering_fields = ['created_at', 'rating']


class AdminReviewModerateView(APIView):
    """
    Moderates a review by toggling public visibility (is_public).
    Hiding a review automatically triggers rating recalculation on the worker profile.
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]

    def post(self, request, pk):
        review = get_object_or_404(Review.objects.select_related('worker'), pk=pk)
        serializer = AdminReviewModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        is_public = serializer.validated_data['is_public']
        reason = serializer.validated_data.get('reason', '')

        previous_visibility = review.is_public
        review.is_public = is_public
        # Saving review triggers update_worker_aggregates() on the worker
        review.save()

        description = (
            f"Review visibility set to {'public' if is_public else 'hidden'}. "
            f"Reason: {reason or 'None provided'}"
        )
        log_admin_event(
            actor=request.user,
            action=AuditLog.Action.REVIEW_MODERATED,
            resource_type='review',
            resource_id=review.id,
            description=description,
            payload={'previous_is_public': previous_visibility, 'new_is_public': is_public, 'reason': reason},
            request=request
        )

        return Response({
            'id': str(review.id),
            'is_public': review.is_public,
            'worker_rating_average': review.worker.rating_average,
            'worker_reviews_count': review.worker.reviews_count,
            'message': f"Review visibility set to {'public' if is_public else 'hidden'}."
        }, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 6. Basic Platform Statistics Views
# -------------------------------------------------------------

class AdminPlatformStatsView(APIView):
    """
    Delivers marketplace KPIs:
    - User breakdowns (customers, trade professionals)
    - Active & completed booking counts
    - Pending verification queue size
    - Platform-wide aggregate revenue volume and satisfaction rating
    """
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]

    def get(self, request):
        total_users = User.objects.count()
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_workers = WorkerProfile.objects.count()
        verified_workers_count = WorkerProfile.objects.filter(is_verified=True).count()
        pending_verifications_count = WorkerProfile.objects.filter(is_verified=False).count()

        total_bookings = Booking.objects.count()
        completed_bookings = Booking.objects.filter(status=Booking.Status.COMPLETED).count()
        active_bookings = Booking.objects.filter(
            status__in=[Booking.Status.PENDING, Booking.Status.ACCEPTED, Booking.Status.IN_PROGRESS]
        ).count()

        total_reviews = Review.objects.filter(is_public=True).count()
        avg_rating_agg = Review.objects.filter(is_public=True).aggregate(avg=Avg('rating'))
        average_platform_rating = round(avg_rating_agg['avg'] or 0.00, 2)

        # Revenue volume from completed bookings
        volume_agg = Booking.objects.filter(status=Booking.Status.COMPLETED).aggregate(vol=Sum('agreed_price'))
        total_volume = round(volume_agg['vol'] or 0.00, 2)

        stats_data = {
            'total_users': total_users,
            'total_customers': total_customers,
            'total_workers': total_workers,
            'verified_workers_count': verified_workers_count,
            'pending_verifications_count': pending_verifications_count,
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'active_bookings': active_bookings,
            'total_reviews': total_reviews,
            'average_platform_rating': average_platform_rating,
            'total_volume': total_volume,
            'currency': 'ETB',
        }

        serializer = AdminPlatformStatsSerializer(stats_data)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 7. Audit Log Views
# -------------------------------------------------------------

class AdminAuditLogListView(generics.ListAPIView):
    """Retrieve immutable audit trail records for compliance and platform security."""
    queryset = AuditLog.objects.select_related('actor').all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdministrator]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AuditLogFilter
    ordering_fields = ['created_at', 'action', 'resource_type']
