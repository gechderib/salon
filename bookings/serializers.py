from datetime import datetime, timedelta

from rest_framework import serializers

from .models import Booking
from services_app.models import Service


class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "business",
            "service",
            "service_name",
            "business_name",
            "date",
            "start_time",
            "end_time",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "end_time", "status", "created_at"]

    def validate(self, attrs):
        service: Service = attrs["service"]
        date = attrs["date"]
        start_time = attrs["start_time"]

        start_dt = datetime.combine(date, start_time)
        end_dt = start_dt + timedelta(minutes=service.duration_minutes)
        attrs["end_time"] = end_dt.time()
        attrs["business"] = service.business
        return attrs

