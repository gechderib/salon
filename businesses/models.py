from django.conf import settings
from django.db import models


class Business(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="businesses",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=500)
    map_url = models.URLField(max_length=1024, blank=True, null=True)
    phone = models.CharField(max_length=20)
    logo = models.URLField(blank=True, null=True)
    working_hours = models.CharField(max_length=255, help_text="Human readable hours, e.g. Mon-Fri 9:00-18:00")
    open_time = models.TimeField(default="09:00:00")
    close_time = models.TimeField(default="18:00:00")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name

