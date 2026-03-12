from django.db import models
from cloudinary.models import CloudinaryField

from businesses.models import Business


class Service(models.Model):
    business = models.ForeignKey(
        Business,
        related_name="services",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.PositiveIntegerField()
    image = CloudinaryField("service_image", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    capacity = models.PositiveIntegerField(default=1, help_text="Number of staff or stations available for this specific service")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.business.name})"

