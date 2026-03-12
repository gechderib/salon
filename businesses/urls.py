from django.urls import path

from .views import SalonListView, SalonDetailView, AvailabilityView
from services_app.views import SalonServicesListView

urlpatterns = [
    path("", SalonListView.as_view(), name="salon-list"),
    path("<int:pk>/", SalonDetailView.as_view(), name="salon-detail"),
    path("<int:pk>/services/", SalonServicesListView.as_view(), name="salon-services"),
    path("<int:pk>/availability/", AvailabilityView.as_view(), name="salon-availability"),
]

