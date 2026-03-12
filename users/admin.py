from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Role, User


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


class BusinessApprovalFilter(admin.SimpleListFilter):
    title = "Business Approval Status"
    parameter_name = "approval_status"

    def lookups(self, request, model_admin):
        return (
            ("pending", "⏳ Pending Approval"),
            ("approved", "✅ Approved Business"),
            ("customer", "👤 Just Customer"),
        )

    def queryset(self, request, queryset):
        if self.value() == "pending":
            return queryset.filter(roles__name=Role.BUSINESS, is_business_approved=False)
        if self.value() == "approved":
            return queryset.filter(is_business_approved=True)
        if self.value() == "customer":
            return queryset.filter(is_business_approved=False).exclude(roles__name=Role.BUSINESS)
        return queryset


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "id",
        "email",
        "username",
        "is_staff",
        "is_business_approved",
        "business_status",
    )
    list_filter = (
        BusinessApprovalFilter,
        "is_staff",
        "is_active",
        "roles",
    )
    search_fields = ("email", "username", "first_name", "last_name")
    filter_horizontal = ("roles", "groups", "user_permissions")

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Custom Fields",
            {"fields": ("phone_number", "profile_picture", "roles", "is_business_approved")},
        ),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Custom Fields",
            {"fields": ("phone_number", "profile_picture", "roles", "is_business_approved")},
        ),
    )

    def business_status(self, obj):
        has_business_role = obj.roles.filter(name=Role.BUSINESS).exists()
        if obj.is_business_approved:
            return "✅ Approved Business"
        elif has_business_role:
            return "⏳ Pending Approval"
        return "👤 Customer"

    business_status.short_description = "Business Status"

