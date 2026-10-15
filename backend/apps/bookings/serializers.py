from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingStatusHistory
from apps.workers.models import WorkerProfile, WorkerService
from apps.services.models import ServiceCategory

class BookingStatusHistorySerializer(serializers.ModelSerializer):
    """Serialization for the immutable audit timeline of booking state changes."""
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = BookingStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by_name',
            'reason',
            'created_at',
        ]


class BookingDetailSerializer(serializers.ModelSerializer):
    """Detailed booking payload with participant details and timeline."""
    customer_id = serializers.UUIDField(source='customer.id', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    customer_city = serializers.CharField(source='customer.city', read_only=True)
    worker_id = serializers.UUIDField(source='worker.id', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    worker_phone = serializers.CharField(source='worker.user.phone_number', read_only=True)
    worker_trade = serializers.CharField(source='worker.trade_title', read_only=True)
    category_slug = serializers.CharField(source='service_category.slug', read_only=True)
    category_name = serializers.CharField(source='service_category.name', read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'reference_number',
            'status',
            'customer_id',
            'customer_name',
            'customer_phone',
            'customer_city',
            'worker_id',
            'worker_name',
            'worker_phone',
            'worker_trade',
            'category_slug',
            'category_name',
            'service_title',
            'scheduled_date',
            'scheduled_time_slot',
            'service_address',
            'service_city',
            'customer_notes',
            'agreed_price',
            'currency',
            'accepted_at',
            'started_at',
            'completed_at',
            'cancelled_at',
            'cancellation_reason',
            'status_history',
            'has_review',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'reference_number', 'status', 'created_at', 'updated_at']

    def get_has_review(self, obj):
        return hasattr(obj, 'review')


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Customer-initiated booking creation serializer.
    Enforces:
    - Service and worker eligibility
    - Future scheduled date
    - Minimum description length (>= 10 chars)
    - Prevention of self-booking
    - Agreed price and currency snapshotting
    """
    worker_id = serializers.UUIDField(write_only=True)
    service_id = serializers.UUIDField(required=False, allow_null=True, write_only=True)
    service_title = serializers.CharField(required=False, max_length=120)
    agreed_price = serializers.DecimalField(required=False, max_digits=10, decimal_places=2)

    class Meta:
        model = Booking
        fields = [
            'id',
            'reference_number',
            'worker_id',
            'service_id',
            'service_title',
            'scheduled_date',
            'scheduled_time_slot',
            'service_address',
            'service_city',
            'customer_notes',
            'agreed_price',
            'currency',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'reference_number', 'status', 'created_at']

    def validate_scheduled_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Scheduled service date cannot be in the past.")
        return value

    def validate_customer_notes(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Please provide a description of the issue or requested repair (at least 10 characters).")
        return value.strip()

    def validate(self, attrs):
        user = self.context['request'].user
        worker_id = attrs.get('worker_id')
        worker = WorkerProfile.objects.filter(id=worker_id).first()

        if not worker:
            raise serializers.ValidationError({"worker_id": "Specified service professional was not found."})

        # Check worker availability
        if not worker.is_available:
            raise serializers.ValidationError({"worker_id": "This professional is currently marked as unavailable for bookings."})

        # Self-booking check
        if worker.user == user or (hasattr(user, 'worker_profile') and worker == user.worker_profile):
            raise serializers.ValidationError("You cannot book a repair service with your own worker profile.")

        attrs['worker_instance'] = worker

        service_id = attrs.get('service_id')
        if service_id:
            service = WorkerService.objects.filter(id=service_id, worker=worker).first()
            if not service:
                raise serializers.ValidationError({"service_id": "Selected service does not belong to this trade professional."})
            if not service.is_active:
                raise serializers.ValidationError({"service_id": "The selected service is currently paused or inactive."})

            attrs['service_instance'] = service
            attrs['category_instance'] = service.category
            
            # Snapshot service title and price from service record
            if not attrs.get('service_title'):
                attrs['service_title'] = service.title
            attrs['agreed_price'] = service.price
            attrs['currency'] = service.currency
        else:
            attrs['service_instance'] = None
            attrs['category_instance'] = worker.primary_category
            if not attrs.get('service_title'):
                attrs['service_title'] = f"General {worker.trade_title} Service"
            if not attrs.get('agreed_price'):
                attrs['agreed_price'] = worker.hourly_rate
            attrs['currency'] = worker.currency

        if attrs['agreed_price'] < 0:
            raise serializers.ValidationError({"agreed_price": "Agreed price cannot be negative."})

        return attrs

    def create(self, validated_data):
        worker = validated_data.pop('worker_instance')
        service = validated_data.pop('service_instance')
        category = validated_data.pop('category_instance')
        validated_data.pop('worker_id')
        validated_data.pop('service_id', None)

        user = self.context['request'].user

        # Create booking starting strictly in PENDING state
        booking = Booking.objects.create(
            customer=user,
            worker=worker,
            service=service,
            service_category=category,
            status=Booking.Status.PENDING,
            **validated_data
        )

        # Initial history record
        BookingStatusHistory.objects.create(
            booking=booking,
            from_status=None,
            to_status=Booking.Status.PENDING,
            changed_by=user,
            reason="Initial booking request submitted by customer."
        )

        return booking


class BookingStatusTransitionSerializer(serializers.Serializer):
    """
    Enforces allowed status transitions and role-based permissions:
    - PENDING -> ACCEPTED (Assigned Worker)
    - PENDING -> DECLINED (Assigned Worker)
    - PENDING / ACCEPTED -> CANCELLED (Customer or Assigned Worker)
    - ACCEPTED -> IN_PROGRESS / COMPLETED (Assigned Worker marks as done)
    - IN_PROGRESS -> COMPLETED (Assigned Worker marks as done)
    """
    new_status = serializers.ChoiceField(choices=Booking.Status.choices)
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        booking = self.context['booking']
        user = self.context['request'].user
        new_status = attrs['new_status']

        if not booking.can_transition_to(new_status) and not user.is_superuser:
            raise serializers.ValidationError(
                f"Transition from '{booking.status}' to '{new_status}' is not permitted."
            )

        # Role checks
        is_worker = hasattr(user, 'worker_profile') and booking.worker == user.worker_profile
        is_customer = booking.customer == user

        if new_status in [Booking.Status.ACCEPTED, Booking.Status.DECLINED]:
            if not is_worker and not user.is_staff:
                raise serializers.ValidationError("Only the assigned worker can accept or decline this request.")

        if new_status in [Booking.Status.IN_PROGRESS, Booking.Status.COMPLETED]:
            if not is_worker and not user.is_staff:
                raise serializers.ValidationError("Only the assigned worker can update progress or mark a job as done.")

        if new_status == Booking.Status.CANCELLED:
            if not is_customer and not is_worker and not user.is_staff:
                raise serializers.ValidationError("Only the customer or assigned worker can cancel this booking.")

        return attrs
