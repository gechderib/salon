from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authentication_app.urls")),
    path("api/users/", include("users.urls")),
    path("api/businesses/", include("businesses.urls")),
    path("api/services/", include("services_app.urls")),
    path("api/bookings/", include("bookings.urls")),
]

