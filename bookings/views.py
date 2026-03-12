from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.responses import api_response
from users.permissions import IsBusinessOwner

from .models import Booking
from .serializers import BookingSerializer


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.roles.filter(name="business").exists():
            return api_response(
                False,
                None,
                "Business owners cannot book services. Please use a customer account.",
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = BookingSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)
        booking = serializer.save(user=request.user)
        return api_response(
            True,
            BookingSerializer(booking).data,
            "Booking created successfully",
            status=status.HTTP_201_CREATED,
        )


class MyBookingsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return api_response(True, serializer.data, "User bookings retrieved successfully")


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk: int) -> Booking:
        return get_object_or_404(Booking, pk=pk, user=user)

    def get(self, request, pk: int):
        booking = self.get_object(request.user, pk)
        serializer = BookingSerializer(booking)
        return api_response(True, serializer.data, "Booking retrieved successfully")


class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)
        if booking.status in [Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED]:
            return api_response(
                False,
                None,
                "Cannot cancel a completed or already cancelled booking.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.STATUS_CANCELLED
        booking.save(update_fields=["status"])
        return api_response(True, BookingSerializer(booking).data, "Booking cancelled successfully")


class BusinessBookingsListView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def get(self, request):
        bookings = Booking.objects.filter(business__owner=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return api_response(True, serializer.data, "Business bookings retrieved successfully")


class BookingConfirmView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def post(self, request, pk: int):
        booking = get_object_or_404(Booking, pk=pk, business__owner=request.user)
        if booking.status != Booking.STATUS_PENDING:
            return api_response(
                False,
                None,
                "Only pending bookings can be confirmed.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.STATUS_CONFIRMED
        booking.save(update_fields=["status"])
        return api_response(True, BookingSerializer(booking).data, "Booking confirmed successfully")


class BookingCompleteView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def post(self, request, pk: int):
        booking = get_object_or_404(Booking, pk=pk, business__owner=request.user)
        if booking.status != Booking.STATUS_CONFIRMED:
            return api_response(
                False,
                None,
                "Only confirmed bookings can be completed.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.STATUS_COMPLETED
        booking.save(update_fields=["status"])
        return api_response(True, BookingSerializer(booking).data, "Booking completed successfully")


class BookingRejectView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def post(self, request, pk: int):
        booking = get_object_or_404(Booking, pk=pk, business__owner=request.user)
        if booking.status in [Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED]:
            return api_response(
                False,
                None,
                "Cannot reject a completed or already cancelled booking.",
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.STATUS_CANCELLED
        booking.save(update_fields=["status"])
        return api_response(True, BookingSerializer(booking).data, "Booking rejected successfully")

