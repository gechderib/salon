from rest_framework import serializers


class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField()
    role = serializers.CharField(required=False, default="customer")


class TelegramLoginSerializer(serializers.Serializer):
    telegram_data = serializers.JSONField()
    role = serializers.CharField(required=False, default="customer")

