from rest_framework import serializers
from django.utils import timezone
from apps.accounts.models import User
from apps.workers.models import WorkerProfile
from apps.services.models import ServiceCategory
from apps.bookings.models import Booking
from apps.reviews.models import Review
from .models import AuditLog

# -------------------------------------------------------------
# User Management Serializers
# -------------------------------------------------------------

class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Serializes user accounts for administrative listing and inspection.
    Strictly excludes password hashes, session secrets, or tokens.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    worker_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'city',
            'is_active',
            'is_staff',
            'is_superuser',
            'is_email_verified',
            'is_phone_verified',
            'worker_profile_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_worker_profile_id(self, obj):
        if hasattr(obj, 'worker_profile'):
            return str(obj.worker_profile.id)
        return None


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Detailed user view for admin inspection."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    worker_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'city',
            'address_line',
            'avatar_url',
            'is_active',
            'is_staff',
            'is_superuser',
            'is_email_verified',
            'is_phone_verified',
            'worker_profile_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_worker_profile_id(self, obj):
        if hasattr(obj, 'worker_profile'):
            return str(obj.worker_profile.id)
        return None


class AdminUserStatusUpdateSerializer(serializers.Serializer):
    """
    Suspends or reactivates a user account.
    Prevents self-suspension by platform administrators.
    """
    is_active = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')

    def validate(self, attrs):
        request = self.context.get('request')
        target_user = self.context.get('target_user')

        if request and request.user == target_user and not attrs.get('is_active'):
            raise serializers.ValidationError({"is_active": "Administrators cannot suspend their own account."})

        return attrs


# -------------------------------------------------------------
# Worker Management Serializers
# -------------------------------------------------------------

class AdminWorkerListSerializer(serializers.ModelSerializer):
    """Worker listing for admin overview and verification queue."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    user_is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    category_name = serializers.CharField(source='primary_category.name', read_only=True)

    class Meta:
        model = WorkerProfile
        fields = [
            'id',
            'user_id',
            'user_name',
            'user_email',
            'user_phone',
            'user_is_active',
            'trade_title',
            'category_name',
            'hourly_rate',
            'currency',
            'experience_years',
            'rating_average',
            'reviews_count',
            'completed_jobs_count',
            'is_verified',
            'verified_at',
            'is_available',
            'is_emergency_ready',
            'created_at',
        ]
        read_only_fields = fields


class AdminWorkerVerificationSerializer(serializers.Serializer):
    """Allows an administrator to approve or revoke a worker's verified badge."""
    is_verified = serializers.BooleanField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')


# -------------------------------------------------------------
# Service Category Serializers
# -------------------------------------------------------------

class AdminServiceCategorySerializer(serializers.ModelSerializer):
    """CRUD operations for marketplace service categories."""
    workers_count = serializers.IntegerField(source='workers.count', read_only=True)

    class Meta:
        model = ServiceCategory
        fields = [
            'id',
            'slug',
            'name',
            'trade_key',
            'description',
            'icon_name',
            'is_active',
            'display_order',
            'workers_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'workers_count', 'created_at', 'updated_at']


# -------------------------------------------------------------
# Booking Overview Serializers
# -------------------------------------------------------------

class AdminBookingListSerializer(serializers.ModelSerializer):
    """Overview of platform bookings across all customers and workers."""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    worker_trade = serializers.CharField(source='worker.trade_title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'reference_number',
            'customer_id',
            'customer_name',
            'customer_email',
            'worker_id',
            'worker_name',
            'worker_trade',
            'service_title',
            'status',
            'scheduled_date',
            'scheduled_time_slot',
            'agreed_price',
            'currency',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class AdminBookingDetailSerializer(serializers.ModelSerializer):
    """Comprehensive single booking inspection for admin mediation."""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    worker_phone = serializers.CharField(source='worker.user.phone_number', read_only=True)
    status_history = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'reference_number',
            'customer_id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'worker_id',
            'worker_name',
            'worker_phone',
            'service_title',
            'problem_description',
            'status',
            'scheduled_date',
            'scheduled_time_slot',
            'service_address',
            'agreed_price',
            'currency',
            'cancellation_reason',
            'status_history',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_status_history(self, obj):
        return [
            {
                'from_status': h.from_status,
                'to_status': h.to_status,
                'changed_by': h.changed_by.get_full_name() if h.changed_by else "System",
                'reason': h.reason,
                'created_at': h.created_at
            }
            for h in obj.status_history.select_related('changed_by').all()
        ]


# -------------------------------------------------------------
# Review Moderation Serializers
# -------------------------------------------------------------

class AdminReviewListSerializer(serializers.ModelSerializer):
    """List reviews including hidden/flagged ones for admin review."""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    service_title = serializers.CharField(source='booking.service_title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'booking_id',
            'customer_name',
            'worker_name',
            'service_title',
            'rating',
            'comment',
            'punctuality_rating',
            'quality_rating',
            'cleanliness_rating',
            'worker_reply',
            'is_public',
            'created_at',
        ]
        read_only_fields = fields


class AdminReviewModerationSerializer(serializers.Serializer):
    """Toggles review visibility to hide defamatory or spam content."""
    is_public = serializers.BooleanField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500, default='')


# -------------------------------------------------------------
# Audit Log Serializer
# -------------------------------------------------------------

class AuditLogSerializer(serializers.ModelSerializer):
    """Audit log inspection."""
    actor_email = serializers.EmailField(source='actor.email', read_only=True)
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    ip_address = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor_email',
            'actor_name',
            'action',
            'resource_type',
            'resource_id',
            'description',
            'payload',
            'ip_address',
            'created_at',
        ]
        read_only_fields = fields


# -------------------------------------------------------------
# Platform Statistics Serializer
# -------------------------------------------------------------

class AdminPlatformStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_workers = serializers.IntegerField()
    verified_workers_count = serializers.IntegerField()
    pending_verifications_count = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    total_reviews = serializers.IntegerField()
    average_platform_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_volume = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField()
