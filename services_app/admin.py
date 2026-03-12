from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "business", "price", "is_active", "created_at")
    list_filter = ("is_active", "created_at", "business")
    search_fields = ("name", "business__name")

