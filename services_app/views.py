from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from common.responses import api_response
from users.permissions import IsBusinessOwner
from businesses.models import Business

from .models import Service
from .serializers import ServiceSerializer


class ServiceListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def get(self, request):
        """
        List services for the authenticated business owner.
        Optional filter: ?business_id=<id>
        """
        qs = Service.objects.filter(business__owner=request.user)
        business_id = request.query_params.get("business_id")
        if business_id:
            qs = qs.filter(business_id=business_id)
        serializer = ServiceSerializer(qs, many=True)
        return api_response(True, serializer.data, "Services retrieved successfully")

    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)

        business: Business = serializer.validated_data["business"]
        if business.owner != request.user:
            return api_response(
                False,
                None,
                "You can only create services for your own salon.",
                status=status.HTTP_403_FORBIDDEN,
            )

        service = serializer.save()
        return api_response(
            True,
            ServiceSerializer(service).data,
            "Service created successfully",
            status=status.HTTP_201_CREATED,
        )


class ServiceDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def get_object(self, user, pk: int) -> Service:
        return get_object_or_404(Service, pk=pk, business__owner=user)

    def get(self, request, pk: int):
        service = self.get_object(request.user, pk)
        serializer = ServiceSerializer(service)
        return api_response(True, serializer.data, "Service retrieved successfully")

    def put(self, request, pk: int):
        service = self.get_object(request.user, pk)
        serializer = ServiceSerializer(instance=service, data=request.data, partial=True)
        if serializer.is_valid():
            business = serializer.validated_data.get("business")
            if business and business.owner != request.user:
                return api_response(
                    False,
                    None,
                    "You can only assign services to your own salon.",
                    status=status.HTTP_403_FORBIDDEN,
                )
            serializer.save()
            return api_response(True, serializer.data, "Service updated successfully")
        return api_response(False, serializer.errors, "Validation error", status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk: int):
        service = self.get_object(request.user, pk)
        service.delete()
        return api_response(True, None, "Service deleted successfully", status=status.HTTP_204_NO_CONTENT)


class SalonServicesListView(APIView):
    """
    Public endpoint for users to view services for a given salon.
    """

    def get(self, request, pk: int):
        services = Service.objects.filter(business_id=pk, is_active=True)
        serializer = ServiceSerializer(services, many=True)
        return api_response(True, serializer.data, "Salon services retrieved successfully")

