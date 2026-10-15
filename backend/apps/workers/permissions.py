from rest_framework import permissions

class IsWorkerProfileOwner(permissions.BasePermission):
    """Allows write operations only to the worker who owns the profile."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and obj.user == request.user)


class IsWorkerServiceOwner(permissions.BasePermission):
    """Allows modification of a worker service only to the owning worker."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and obj.worker.user == request.user)
