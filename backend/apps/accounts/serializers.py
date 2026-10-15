from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User

class UserDetailSerializer(serializers.ModelSerializer):
    """Read serializer for full user profile details."""
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
            'is_email_verified',
            'is_phone_verified',
            'worker_profile_id',
            'created_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'created_at', 'worker_profile_id']

    def get_worker_profile_id(self, obj):
        if hasattr(obj, 'worker_profile'):
            return str(obj.worker_profile.id)
        return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows authenticated user to update their personal profile info."""
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone_number',
            'city',
            'address_line',
            'avatar_url',
        ]

    def validate_phone_number(self, value):
        user = self.instance
        if User.objects.exclude(id=user.id).filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered to another account.")
        return value


class LogoutSerializer(serializers.Serializer):
    """Blacklists the provided refresh token to securely log out."""
    refresh = serializers.CharField(required=True, help_text="Refresh token to invalidate")

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        from rest_framework_simplejwt.tokens import RefreshToken, TokenError
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except TokenError as e:
            raise serializers.ValidationError({"refresh": "Token is invalid, expired, or already blacklisted."})


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    """Registers a new customer account."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'city',
            'address_line',
            'password',
            'password_confirm',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role=User.Role.CUSTOMER,
            password=password,
            **validated_data
        )
        return user


class WorkerRegistrationSerializer(serializers.ModelSerializer):
    """
    Registers a new worker account and atomically provisions their initial WorkerProfile.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    # Worker Profile Fields
    primary_category_id = serializers.UUIDField(write_only=True)
    trade_title = serializers.CharField(max_length=120, write_only=True)
    hourly_rate = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)
    experience_years = serializers.IntegerField(min_value=0, max_value=60, write_only=True)
    bio = serializers.CharField(min_length=20, write_only=True)
    service_areas = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'city',
            'password',
            'password_confirm',
            'primary_category_id',
            'trade_title',
            'hourly_rate',
            'experience_years',
            'bio',
            'service_areas',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password fields didn't match."})
        if attrs['hourly_rate'] <= 0:
            raise serializers.ValidationError({"hourly_rate": "Hourly rate must be greater than zero."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        from apps.workers.models import WorkerProfile
        from apps.services.models import ServiceCategory

        # Extract worker profile fields
        category_id = validated_data.pop('primary_category_id')
        trade_title = validated_data.pop('trade_title')
        hourly_rate = validated_data.pop('hourly_rate')
        experience_years = validated_data.pop('experience_years')
        bio = validated_data.pop('bio')
        service_areas = validated_data.pop('service_areas', [])
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        category = ServiceCategory.objects.filter(id=category_id).first()
        if not category:
            raise serializers.ValidationError({"primary_category_id": "Specified service category not found."})

        # 1. Create User
        user = User.objects.create_user(
            role=User.Role.WORKER,
            password=password,
            **validated_data
        )

        # 2. Create WorkerProfile
        WorkerProfile.objects.create(
            user=user,
            primary_category=category,
            trade_title=trade_title,
            hourly_rate=hourly_rate,
            experience_years=experience_years,
            bio=bio,
            service_areas=service_areas,
        )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT claim injector embedding role and profile ID in auth payload."""
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.get_full_name(),
            'role': self.user.role,
            'city': self.user.city,
            'worker_profile_id': str(self.user.worker_profile.id) if hasattr(self.user, 'worker_profile') else None,
        }
        return data
