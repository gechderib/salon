from django.urls import path

from .views import ProfileView, BecomeBusinessView

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="user-profile"),
    path("become-business/", BecomeBusinessView.as_view(), name="become-business"),
]

