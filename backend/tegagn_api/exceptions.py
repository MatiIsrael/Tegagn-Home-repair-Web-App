from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Standardized API exception handler.
    Formats errors consistently:
    {
        "status": "error",
        "status_code": 400,
        "message": "Human-readable summary",
        "errors": { ... field specific errors or details ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "status": "error",
            "status_code": response.status_code,
            "message": "Validation or request processing error.",
            "errors": response.data,
        }

        # Provide friendly top-level message if detail string is present
        if isinstance(response.data, dict) and "detail" in response.data:
            custom_data["message"] = str(response.data["detail"])

        response.data = custom_data
    else:
        # Unhandled server exception
        logger.error(f"Unhandled exception in API view: {exc}", exc_info=context.get("request"))
        return Response(
            {
                "status": "error",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "An unexpected internal server error occurred.",
                "errors": {"detail": str(exc)},
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
