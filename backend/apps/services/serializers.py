from rest_framework import serializers
from .models import ServiceCategory

class ServiceCategorySerializer(serializers.ModelSerializer):
    workers_count = serializers.SerializerMethodField()

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
        ]
        read_only_fields = ['id', 'created_at', 'workers_count']

    def get_workers_count(self, obj):
        return obj.workers.filter(is_available=True).count()
