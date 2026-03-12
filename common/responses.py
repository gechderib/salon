from typing import Any, Optional

from rest_framework.response import Response
from rest_framework import status as drf_status


def api_response(
    success: bool,
    data: Optional[Any] = None,
    message: str = "",
    status: int = drf_status.HTTP_200_OK,
) -> Response:
    payload = {
        "success": success,
        "data": data,
        "message": message,
    }
    return Response(payload, status=status)

