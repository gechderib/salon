from django.urls import path

from .views import GoogleLoginView, TelegramLoginView

urlpatterns = [
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("telegram-login/", TelegramLoginView.as_view(), name="telegram-login"),
]

