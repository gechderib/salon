from django.urls import path

from .views import ServiceListCreateView, ServiceDetailView, SalonServicesListView

urlpatterns = [
    path("", ServiceListCreateView.as_view(), name="service-list-create"),
    path("<int:pk>/", ServiceDetailView.as_view(), name="service-detail"),
    path("salon/<int:pk>/", SalonServicesListView.as_view(), name="salon-services"),
]

