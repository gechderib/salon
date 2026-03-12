from django.urls import path

from .views import (
    BookingCreateView,
    MyBookingsListView,
    BookingDetailView,
    BookingCancelView,
    BusinessBookingsListView,
    BookingConfirmView,
    BookingCompleteView,
    BookingRejectView,
)

urlpatterns = [
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("my/", MyBookingsListView.as_view(), name="my-bookings"),
    path("<int:pk>/", BookingDetailView.as_view(), name="booking-detail"),
    path("<int:pk>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),
    path("business/", BusinessBookingsListView.as_view(), name="business-bookings"),
    path("<int:pk>/confirm/", BookingConfirmView.as_view(), name="booking-confirm"),
    path("<int:pk>/complete/", BookingCompleteView.as_view(), name="booking-complete"),
    path("<int:pk>/reject/", BookingRejectView.as_view(), name="booking-reject"),
]

