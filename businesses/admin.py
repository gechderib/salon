from django.contrib import admin

from .models import Business


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "phone", "created_at")
    search_fields = ("name", "owner__email", "owner__username")
    list_filter = ("created_at",)

