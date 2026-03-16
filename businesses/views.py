from datetime import datetime, timedelta, time
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from common.responses import api_response
from users.permissions import ReadOnly, IsBusiness, IsAuthenticated
from .models import Business
from .serializers import BusinessSerializer
from services_app.models import Service
from bookings.models import Booking

class SalonListView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsBusiness()]
        return [ReadOnly()]

    def get(self, request):
        salons = Business.objects.all()
        serializer = BusinessSerializer(salons, many=True)
        return api_response(True, serializer.data, "Salons retrieved successfully")

    def post(self, request):
        if Business.objects.filter(owner=request.user).exists():
            return api_response(False, None, "You already have a business profile.", status=400)
        
        serializer = BusinessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return api_response(True, serializer.data, "Business created successfully", status=201)
        return api_response(False, serializer.errors, "Validation error", status=400)


class SalonDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH"]:
            return [IsBusiness()]
        return [ReadOnly()]

    def get(self, request, pk: int):
        salon = get_object_or_404(Business, pk=pk)
        serializer = BusinessSerializer(salon)
        return api_response(True, serializer.data, "Salon retrieved successfully")

    def put(self, request, pk: int):
        salon = get_object_or_404(Business, pk=pk)
        if salon.owner != request.user:
            return api_response(False, None, "You do not own this business.", status=403)
        
        serializer = BusinessSerializer(salon, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return api_response(True, serializer.data, "Business updated successfully")
        return api_response(False, serializer.errors, "Validation error", status=400)


class AvailabilityView(APIView):
    permission_classes = [ReadOnly]

    def get(self, request, pk: int):
        date_str = request.query_params.get("date")
        service_id = request.query_params.get("service_id")

        if not date_str or not service_id:
            return api_response(False, None, "date and service_id are required", status=400)

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            service = Service.objects.get(pk=service_id)
            business = get_object_or_404(Business, pk=pk)
        except Exception as e:
            return api_response(False, None, str(e), status=400)

        # Generate slots based on service duration
        slots = []
        current_time = datetime.combine(target_date, business.open_time)
        end_boundary = datetime.combine(target_date, business.close_time)

        duration = timedelta(minutes=service.duration_minutes)

        while current_time + duration <= end_boundary:
            slot_start = current_time.time()
            slot_end = (current_time + duration).time()

            # Count overlapping bookings for this specific service
            overlapping_count = Booking.objects.filter(
                business=business,
                service=service,
                date=target_date,
                status__in=[Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED, Booking.STATUS_COMPLETED],
                start_time__lt=slot_end,
                end_time__gt=slot_start
            ).count()

            if overlapping_count < service.capacity:
                # Filter out past slots for today
                now = datetime.now()
                is_today = target_date == now.date()
                if is_today and current_time.time() < now.time():
                    pass # Skip past slots
                else:
                    slots.append({
                        "start": slot_start.strftime("%H:%M"),
                        "end": slot_end.strftime("%H:%M"),
                        "available_count": service.capacity - overlapping_count
                    })

            # The gap is now dynamic based on duration
            current_time += duration

        return api_response(True, slots, "Availability retrieved successfully")

