from rest_framework import serializers
from .models import WorkerProfile, WorkerService
from apps.services.serializers import ServiceCategorySerializer

class WorkerServiceSerializer(serializers.ModelSerializer):
    """
    CRUD serializer for discrete worker-owned services and prices.
    Enforces positive pricing, currency specification, and title uniqueness per worker.
    """
    category_id = serializers.UUIDField(write_only=True, required=False)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    trade_key = serializers.CharField(source='category.trade_key', read_only=True)
    worker_id = serializers.UUIDField(source='worker.id', read_only=True)
    worker_name = serializers.CharField(source='worker.user.get_full_name', read_only=True)

    class Meta:
        model = WorkerService
        fields = [
            'id',
            'worker_id',
            'worker_name',
            'category_id',
            'category_name',
            'category_slug',
            'trade_key',
            'title',
            'description',
            'price',
            'currency',
            'price_type',
            'estimated_duration_minutes',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'worker_id', 'worker_name', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Service title must be at least 3 characters.")
        return value.strip()

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be greater than or equal to 0.00.")
        return value

    def validate(self, attrs):
        category_id = attrs.get('category_id')
        if category_id:
            from apps.services.models import ServiceCategory
            cat = ServiceCategory.objects.filter(id=category_id, is_active=True).first()
            if not cat:
                raise serializers.ValidationError({"category_id": "Specified service category not found or inactive."})
            attrs['category_instance'] = cat
        return attrs

    def create(self, validated_data):
        category = validated_data.pop('category_instance', None)
        validated_data.pop('category_id', None)
        worker = self.context['request'].user.worker_profile
        if not category:
            category = worker.primary_category

        if WorkerService.objects.filter(worker=worker, title__iexact=validated_data['title']).exists():
            raise serializers.ValidationError({"title": "A service with this title already exists on your profile."})

        return WorkerService.objects.create(worker=worker, category=category, **validated_data)

    def update(self, instance, validated_data):
        category = validated_data.pop('category_instance', None)
        validated_data.pop('category_id', None)
        if category:
            instance.category = category

        new_title = validated_data.get('title')
        if new_title and new_title.lower() != instance.title.lower():
            if WorkerService.objects.filter(worker=instance.worker, title__iexact=new_title).exclude(id=instance.id).exists():
                raise serializers.ValidationError({"title": "A service with this title already exists on your profile."})

        return super().update(instance, validated_data)


class WorkerProfileListSerializer(serializers.ModelSerializer):
    """
    Concise public representation for worker directory cards and search results.
    Strictly excludes sensitive personal details (no email, address, or credentials).
    """
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    avatar_url = serializers.CharField(source='user.avatar_url', read_only=True)
    city = serializers.CharField(source='user.city', read_only=True)
    category_slug = serializers.CharField(source='primary_category.slug', read_only=True)
    category_name = serializers.CharField(source='primary_category.name', read_only=True)
    trade_key = serializers.CharField(source='primary_category.trade_key', read_only=True)

    class Meta:
        model = WorkerProfile
        fields = [
            'id',
            'full_name',
            'avatar_url',
            'city',
            'trade_title',
            'category_slug',
            'category_name',
            'trade_key',
            'hourly_rate',
            'currency',
            'rating_average',
            'reviews_count',
            'completed_jobs_count',
            'experience_years',
            'is_available',
            'is_emergency_ready',
            'is_verified',
            'service_areas',
            'skills',
            'created_at',
        ]


class WorkerProfileDetailSerializer(serializers.ModelSerializer):
    """
    Detailed public storefront profile for an individual worker.
    Shows active priced services and public ratings without exposing private email or home address.
    """
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    avatar_url = serializers.CharField(source='user.avatar_url', read_only=True)
    city = serializers.CharField(source='user.city', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    primary_category = ServiceCategorySerializer(read_only=True)
    services = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile
        fields = [
            'id',
            'full_name',
            'phone_number',
            'avatar_url',
            'city',
            'trade_title',
            'primary_category',
            'bio',
            'experience_years',
            'hourly_rate',
            'currency',
            'is_available',
            'is_emergency_ready',
            'is_verified',
            'verified_at',
            'service_areas',
            'skills',
            'certifications',
            'rating_average',
            'reviews_count',
            'completed_jobs_count',
            'services',
            'created_at',
        ]

    def get_services(self, obj):
        active_services = obj.services.filter(is_active=True)
        return WorkerServiceSerializer(active_services, many=True).data


class WorkerProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows authenticated workers to update their trade profile and pricing."""
    class Meta:
        model = WorkerProfile
        fields = [
            'trade_title',
            'primary_category',
            'bio',
            'experience_years',
            'hourly_rate',
            'currency',
            'is_available',
            'is_emergency_ready',
            'service_areas',
            'skills',
            'certifications',
        ]

    def validate_hourly_rate(self, value):
        if value < 10 or value > 300:
            raise serializers.ValidationError("Hourly rate must be between 10.00 and 300.00.")
        return value


class WorkerProfileCreateSerializer(serializers.ModelSerializer):
    """Allows an existing authenticated user to provision their WorkerProfile."""
    primary_category_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkerProfile
        fields = [
            'id',
            'primary_category_id',
            'trade_title',
            'bio',
            'experience_years',
            'hourly_rate',
            'currency',
            'service_areas',
            'skills',
            'certifications',
            'is_emergency_ready',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_hourly_rate(self, value):
        if value < 10 or value > 300:
            raise serializers.ValidationError("Hourly rate must be between 10.00 and 300.00.")
        return value

    def validate_primary_category_id(self, value):
        from apps.services.models import ServiceCategory
        if not ServiceCategory.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Specified service category does not exist or is inactive.")
        return value

    def create(self, validated_data):
        from apps.services.models import ServiceCategory
        user = self.context['request'].user
        if hasattr(user, 'worker_profile'):
            raise serializers.ValidationError("You already have an active worker profile.")

        category_id = validated_data.pop('primary_category_id')
        category = ServiceCategory.objects.get(id=category_id)

        # Elevate user's role to worker
        if user.role != 'worker':
            user.role = 'worker'
            user.save(update_fields=['role'])

        return WorkerProfile.objects.create(
            user=user,
            primary_category=category,
            **validated_data
        )
