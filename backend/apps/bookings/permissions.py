from rest_framework import permissions

class IsBookingParticipant(permissions.BasePermission):
    """
    Object-level permission allowing only the customer or the worker
    associated with the booking (or admin) to view/interact with it.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        # Customer check
        if obj.customer == request.user:
            return True

        # Worker check
        if hasattr(request.user, 'worker_profile') and obj.worker == request.user.worker_profile:
            return True

        return False
