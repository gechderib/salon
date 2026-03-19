from typing import Tuple

from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from common.responses import api_response
from users.models import User, Role
from users.serializers import UserSerializer

from .google_auth import verify_google_id_token
from .telegram_auth import verify_telegram_auth
from .serializers import GoogleLoginSerializer, TelegramLoginSerializer
import cloudinary.uploader


def issue_tokens_for_user(user: User) -> Tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


class GoogleLoginView(APIView):
    """
    POST /api/auth/google-login
    Body: { "id_token": "<google_id_token>" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"DEBUG: Received Google Login request: {request.data}")
        serializer = GoogleLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)

        payload = verify_google_id_token(serializer.validated_data["id_token"])
        if not payload:
            return api_response(False, None, "Invalid Google token", status=status.HTTP_400_BAD_REQUEST)

        email = payload.get("email")
        if not email:
            return api_response(False, None, "Google token missing email", status=status.HTTP_400_BAD_REQUEST)

        role_name = serializer.validated_data.get("role", Role.CUSTOMER)

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": payload.get("given_name", ""),
                    "last_name": payload.get("family_name", ""),
                    "profile_picture": payload.get("picture", ""),
                    "is_active": True,
                },
            )
            # Assign role if needed
            if not user.roles.exists():
                role_obj, _ = Role.objects.get_or_create(name=role_name)
                user.roles.add(role_obj)
                if role_name == Role.BUSINESS:
                    user.is_business_approved = True
                    user.save()

            if payload.get("picture"):
                # Upload to cloudinary and save
                try:
                    upload_data = cloudinary.uploader.upload(payload["picture"], folder="profile_pics/")
                    user.profile_picture = upload_data["public_id"]
                    user.save()
                except Exception as e:
                    # Log error, but don't fail login
                    print(f"Cloudinary upload failed: {e}")

        access, refresh = issue_tokens_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": access,
            "refresh": refresh,
        }
        message = "User created successfully" if created else "Login successful"
        return api_response(True, data, message)


class TelegramLoginView(APIView):
    """
    POST /api/auth/telegram-login
    Body: { "telegram_data": { ...telegram auth payload... } }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TelegramLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)

        payload = verify_telegram_auth(serializer.validated_data["telegram_data"])
        if not payload:
            return api_response(False, None, "Invalid Telegram auth data", status=status.HTTP_400_BAD_REQUEST)

        role_name = serializer.validated_data.get("role", Role.CUSTOMER)

        telegram_id = str(payload.get("id"))
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                username=telegram_id,
                defaults={
                    "first_name": payload.get("first_name", ""),
                    "last_name": payload.get("last_name", ""),
                    "phone_number": payload.get("phone_number", ""),
                    "is_active": True,
                    "email": f"{telegram_id}@telegram.com", # Placeholder since TG doesn't provide email
                },
            )
            # Assign role if needed
            if not user.roles.exists():
                role_obj, _ = Role.objects.get_or_create(name=role_name)
                user.roles.add(role_obj)
                if role_name == Role.BUSINESS:
                    user.is_business_approved = True
                    user.save()

            if payload.get("photo_url"):
                try:
                    upload_data = cloudinary.uploader.upload(payload["photo_url"], folder="profile_pics/")
                    user.profile_picture = upload_data["public_id"]
                    user.save()
                except Exception as e:
                    print(f"Cloudinary upload failed: {e}")

        access, refresh = issue_tokens_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": access,
            "refresh": refresh,
        }
        message = "User created successfully" if created else "Login successful"
        return api_response(True, data, message)

