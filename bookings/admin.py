from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "business", "service", "date", "start_time", "status", "created_at")
    list_filter = ("status", "date", "business")
    search_fields = ("user__email", "business__name", "service__name")

