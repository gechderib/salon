from rest_framework import serializers

from .models import Business


class BusinessSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Business
        fields = [
            "id",
            "name",
            "description",
            "address",
            "map_url",
            "phone",
            "owner",
            "logo",
            "working_hours",
            "open_time",
            "close_time",
            "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]

