from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "business",
            "name",
            "description",
            "price",
            "duration_minutes",
            "image",
            "is_active",
            "capacity",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

