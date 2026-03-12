from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField


class Role(models.Model):
    CUSTOMER = "customer"
    BUSINESS = "business"
    ADMIN = "admin"

    ROLE_CHOICES = [
        (CUSTOMER, "Customer"),
        (BUSINESS, "Business"),
        (ADMIN, "Admin"),
    ]

    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = CloudinaryField("image", blank=True, null=True)
    roles = models.ManyToManyField(Role, related_name="users", blank=True)
    is_business_approved = models.BooleanField(default=False)

    REQUIRED_FIELDS = ["email"]

    def __str__(self) -> str:
        return self.username or self.email

    @property
    def is_customer(self) -> bool:
        return self.roles.filter(name=Role.CUSTOMER).exists()

    @property
    def is_business(self) -> bool:
        return self.roles.filter(name=Role.BUSINESS).exists()

    @property
    def is_admin_role(self) -> bool:
        return self.roles.filter(name=Role.ADMIN).exists()

