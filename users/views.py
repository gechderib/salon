from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated as DRFIsAuthenticated

from common.responses import api_response

from .models import Role, User
from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    BecomeBusinessRequestSerializer,
)


class ProfileView(APIView):
    permission_classes = [DRFIsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_response(True, serializer.data, "Profile retrieved successfully")

    def put(self, request):
        serializer = UserUpdateSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return api_response(True, UserSerializer(request.user).data, "Profile updated successfully")
        return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)


class BecomeBusinessView(APIView):
    permission_classes = [DRFIsAuthenticated]

    def post(self, request):
        serializer = BecomeBusinessRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)

        business_role, _ = Role.objects.get_or_create(name=Role.BUSINESS)
        request.user.roles.add(business_role)
        # For MVP, mark as not yet approved; an admin can flip the flag in Django admin.
        request.user.is_business_approved = False
        request.user.save(update_fields=["is_business_approved"])

        return api_response(
            True,
            UserSerializer(request.user).data,
            "Business role requested successfully. Awaiting admin approval.",
        )

