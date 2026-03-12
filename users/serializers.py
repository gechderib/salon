import cloudinary
from cloudinary import CloudinaryImage
from rest_framework import serializers

from .models import User, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name"]


class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "profile_picture",
            "roles",
            "is_active",
            "is_customer",
            "is_business",
            "is_admin_role",
            "is_business_approved",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "roles", "is_active", "date_joined"]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            # If it's a CloudinaryResource object
            if hasattr(obj.profile_picture, 'url'):
                return obj.profile_picture.url
            
            # If it's a string
            val = str(obj.profile_picture)
            if not val:
                return None
            if val.startswith(('http://', 'https://')):
                return val
            
            # Use cloudinary to build the URL if it's just a public_id
            try:
                return CloudinaryImage(val).build_url(secure=True)
            except Exception:
                return None
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "profile_picture",
        ]

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            if hasattr(obj.profile_picture, 'url'):
                return obj.profile_picture.url
            val = str(obj.profile_picture)
            if not val:
                return None
            if val.startswith(('http://', 'https://')):
                return val
            try:
                return CloudinaryImage(val).build_url(secure=True)
            except Exception:
                return None
        return None


class BecomeBusinessRequestSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)

