from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Role, User


class IsAuthenticated(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        user: User = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser or user.is_admin_role))


class IsBusinessOwner(BasePermission):
    def has_permission(self, request, view) -> bool:
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_business and user.is_business_approved


class IsCustomer(BasePermission):
    def has_permission(self, request, view) -> bool:
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_customer


class ReadOnly(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS

