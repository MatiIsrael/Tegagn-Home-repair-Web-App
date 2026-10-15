from rest_framework import serializers
from django.utils import timezone
from .models import Review
from apps.bookings.models import Booking

class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_avatar = serializers.CharField(source='customer.avatar_url', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)
    worker_id = serializers.UUIDField(source='worker.id', read_only=True)
    service_title = serializers.CharField(source='booking.service_title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'booking',
            'customer_name',
            'customer_avatar',
            'worker_id',
            'worker_name',
            'service_title',
            'rating',
            'comment',
            'punctuality_rating',
            'quality_rating',
            'cleanliness_rating',
            'worker_reply',
            'worker_replied_at',
            'created_at',
        ]
        read_only_fields = ['id', 'booking', 'worker_reply', 'worker_replied_at', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Validates review submission ensuring:
    1. Booking exists and belongs to the requesting customer.
    2. Self-reviews are strictly forbidden (worker cannot review their own service).
    3. Booking status is strictly 'completed'.
    4. No review already exists for this booking (strict 1-to-1 relationship).
    5. Ratings are valid integers from 1 to 5.
    6. Written feedback comment meets minimum length requirement.
    """
    booking_id = serializers.UUIDField(write_only=True)
    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            'min_value': 'Overall rating must be at least 1 star.',
            'max_value': 'Overall rating cannot exceed 5 stars.'
        }
    )
    comment = serializers.CharField(
        min_length=10,
        max_length=2000,
        error_messages={
            'min_length': 'Review feedback must be at least 10 characters long.',
            'blank': 'Review feedback cannot be empty.'
        }
    )
    punctuality_rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=False,
        allow_null=True,
        error_messages={
            'min_value': 'Punctuality rating must be between 1 and 5.',
            'max_value': 'Punctuality rating must be between 1 and 5.'
        }
    )
    quality_rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=False,
        allow_null=True,
        error_messages={
            'min_value': 'Quality rating must be between 1 and 5.',
            'max_value': 'Quality rating must be between 1 and 5.'
        }
    )
    cleanliness_rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=False,
        allow_null=True,
        error_messages={
            'min_value': 'Cleanliness rating must be between 1 and 5.',
            'max_value': 'Cleanliness rating must be between 1 and 5.'
        }
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'booking_id',
            'rating',
            'comment',
            'punctuality_rating',
            'quality_rating',
            'cleanliness_rating',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_booking_id(self, value):
        user = self.context['request'].user
        booking = Booking.objects.filter(id=value).select_related('customer', 'worker__user').first()

        if not booking:
            raise serializers.ValidationError("Booking not found.")

        if booking.customer != user:
            raise serializers.ValidationError("You can only review bookings made from your customer account.")

        if booking.worker.user == user:
            raise serializers.ValidationError("You cannot review your own service booking.")

        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError(
                f"Only completed jobs can be reviewed. Current status is '{booking.status}'."
            )

        if hasattr(booking, 'review'):
            raise serializers.ValidationError("A review has already been submitted for this booking.")

        self.context['booking_instance'] = booking
        return value

    def create(self, validated_data):
        validated_data.pop('booking_id')
        booking = self.context['booking_instance']
        user = self.context['request'].user

        return Review.objects.create(
            booking=booking,
            customer=user,
            worker=booking.worker,
            **validated_data
        )


class ReviewReplySerializer(serializers.ModelSerializer):
    """Allows worker to post an official reply to a customer review."""
    worker_reply = serializers.CharField(
        min_length=5,
        max_length=1500,
        error_messages={
            'min_length': 'Worker reply must be at least 5 characters long.',
            'blank': 'Reply cannot be blank.'
        }
    )

    class Meta:
        model = Review
        fields = ['worker_reply', 'worker_replied_at']
        read_only_fields = ['worker_replied_at']

    def validate(self, attrs):
        instance = self.instance
        if instance and instance.worker_reply:
            raise serializers.ValidationError({"worker_reply": "A reply has already been submitted for this review."})
        return attrs

    def update(self, instance, validated_data):
        instance.worker_reply = validated_data['worker_reply']
        instance.worker_replied_at = timezone.now()
        instance.save(update_fields=['worker_reply', 'worker_replied_at'])
        return instance
